import { memo, useEffect, useMemo, useState } from "react";
import { erc20Abi, erc721Abi, formatEther } from "viem";
import {
  useAccount,
  useBlockNumber,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Button, Container, Mana } from "decentraland-ui";
import { Network } from "@dcl/schemas";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  EXODUS_DAO_CONTRACT_ADDRESS,
  MANA_TOKEN_CONTRACT_ADDRESS,
  TOWN_TOKEN_CONTRACT_ADDRESS,
  getContractUrl,
} from "../eth";
import { config } from "../config";
import { toCoords } from "../lib/coords";
import {
  PROPOSAL,
  PROPOSAL_ID,
  PROPOSAL_NUMBER,
  PROPOSAL_STATES,
  PROPOSAL_TRANSACTION,
  REFUND_CONTRACT_ADDRESS,
  governorAbi,
  refundAbi,
} from "../lib/unwind";
import { useTown } from "../modules/town";
import { useSnapshot } from "../modules/snapshot";
import { useHoldings } from "../modules/holdings";
import "./UnwindPage.css";

const SUCCEEDED = 4;
const EXECUTED = 7;

const mana = (amount: bigint) =>
  Number(formatEther(amount)).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

export const UnwindPage = memo(() => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { owners, reload } = useTown();
  const { tokenIds: held, reload: reloadHoldings } = useHoldings();
  const { snapshot, amounts, getProof } = useSnapshot();
  const { data: block } = useBlockNumber({ watch: true });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const governor = { address: EXODUS_DAO_CONTRACT_ADDRESS, abi: governorAbi } as const;
  const refund = { address: REFUND_CONTRACT_ADDRESS, abi: refundAbi } as const;
  const { data, refetch } = useReadContracts({
    allowFailure: true,
    contracts: [
      { ...governor, functionName: "state", args: [PROPOSAL_ID] },
      { ...governor, functionName: "proposalVotes", args: [PROPOSAL_ID] },
      { ...governor, functionName: "proposalDeadline", args: [PROPOSAL_ID] },
      { ...refund, functionName: "active" },
      { ...refund, functionName: "remainingAllocation" },
      {
        address: MANA_TOKEN_CONTRACT_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [EXODUS_DAO_CONTRACT_ADDRESS],
      },
      {
        address: TOWN_TOKEN_CONTRACT_ADDRESS,
        abi: erc721Abi,
        functionName: "isApprovedForAll",
        args: [address ?? EXODUS_DAO_CONTRACT_ADDRESS, REFUND_CONTRACT_ADDRESS],
      },
    ],
  });
  const state = data?.[0].result as number | undefined;
  const votes = data?.[1].result as readonly [bigint, bigint, bigint] | undefined;
  const deadline = data?.[2].result as bigint | undefined;
  const isActive = data?.[3].result === true;
  const remaining = data?.[4].result as bigint | undefined;
  const treasury = data?.[5].result as bigint | undefined;
  const isApproved = !!address && data?.[6].result === true;

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const isBusy = isPending || isConfirming;
  useEffect(() => {
    if (isSuccess) {
      refetch();
      reload();
      reloadHoldings();
      setSelected(new Set());
      reset();
    }
  }, [isSuccess, refetch, reload, reloadHoldings, reset]);

  // The plots this account holds onchain, which it can return, and the ones it already returned.
  const mine = useMemo(() => {
    if (!address) return [];
    const holding = held.map((id) => ({ id, returned: false, amount: amounts.get(id) }));
    const returned = owners.flatMap(({ owner, returned }, id) =>
      returned && owner.toLowerCase() === address.toLowerCase() && !held.includes(String(id))
        ? [{ id: String(id), returned: true, amount: amounts.get(String(id)) }]
        : []
    );
    return [...holding, ...returned].sort((a, b) => Number(a.id) - Number(b.id));
  }, [owners, held, address, amounts]);
  const returnable = mine.filter((p) => !p.returned && p.amount !== undefined);
  const chosen = returnable.filter((p) => selected.has(p.id));
  const chosenTotal = chosen.reduce((sum, p) => sum + (p.amount ?? 0n), 0n);
  const returnedCount = owners.filter((o) => o.returned).length;

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const execute = () =>
    writeContract({
      ...governor,
      functionName: "execute",
      args: [PROPOSAL.targets, PROPOSAL.values, PROPOSAL.calldatas, PROPOSAL.descriptionHash],
    });
  const approve = () =>
    writeContract({
      address: TOWN_TOKEN_CONTRACT_ADDRESS,
      abi: erc721Abi,
      functionName: "setApprovalForAll",
      args: [REFUND_CONTRACT_ADDRESS, true],
    });
  const returnPlots = () =>
    writeContract({
      ...refund,
      functionName: "refundBatch",
      args: [
        chosen.map((p) => BigInt(p.id)),
        chosen.map((p) => p.amount!),
        chosen.map((p) => getProof(p.id)),
      ],
    });

  const status = isActive
    ? "Returns are open"
    : state === undefined
    ? "Loading…"
    : state === SUCCEEDED
    ? "Passed · waiting for execution"
    : state === 1 && deadline && block
    ? `Voting · closes in ${(deadline - block).toLocaleString()} blocks`
    : PROPOSAL_STATES[state];

  const message =
    error && !/denied|rejected/i.test(error.message)
      ? ("shortMessage" in error ? (error.shortMessage as string) : error.message)
      : null;

  return (
    <>
      <Navbar />
      <div className="UnwindPage dcl page">
        <Container>
          <section className="hero">
            <p className="eyebrow">EXODUS DAO · PROPOSAL #{PROPOSAL_NUMBER}</p>
            <h1>Exodus Town is unwinding</h1>
            <p className="intro">
              Proposal #{PROPOSAL_NUMBER} winds down the Exodus DAO. Once it is
              executed, every citizen can hand their plot back to the DAO in
              exchange for the MANA it cost to mint at auction. Decided by vote,
              settled onchain.
            </p>
          </section>

          <section className="stats">
            <div>
              <span>Proposal</span>
              <strong>{status}</strong>
              {votes ? (
                <small>
                  {votes[1].toString()} for · {votes[0].toString()} against ·{" "}
                  {votes[2].toString()} abstain
                </small>
              ) : null}
            </div>
            <div>
              <span>Minting costs</span>
              <strong>
                <Mana network={Network.MATIC} inline />
                {snapshot ? mana(BigInt(snapshot.totalAllocation)) : "—"}
              </strong>
              <small>
                {isActive && remaining !== undefined
                  ? `${mana(remaining)} MANA still to be returned`
                  : treasury !== undefined
                  ? `DAO treasury: ${mana(treasury)} MANA`
                  : null}
              </small>
            </div>
            <div>
              <span>Plots returned</span>
              <strong>
                {returnedCount} / {snapshot ? snapshot.refunds.length : "—"}
              </strong>
              <small>No deadline</small>
            </div>
          </section>

          <div className="columns">
            <section className="card">
              {!isActive ? (
                <>
                  <h2>
                    {state === SUCCEEDED
                      ? "The proposal passed"
                      : state === EXECUTED
                      ? "The proposal was executed"
                      : "Returns open after the proposal is executed"}
                  </h2>
                  <p>
                    {state === SUCCEEDED
                      ? "Anyone can execute it. One transaction pauses the auctions, moves the plots' total minting cost from the treasury into the refund contract, and opens returns."
                      : "When voting ends and the proposal passes, anyone can execute it. One transaction pauses the auctions, moves the plots' total minting cost from the treasury into the refund contract, and opens returns."}
                  </p>
                  {state === SUCCEEDED ? (
                    isConnected ? (
                      <Button primary loading={isBusy} disabled={isBusy} onClick={execute}>
                        Execute proposal #{PROPOSAL_NUMBER}
                      </Button>
                    ) : (
                      <Button primary onClick={() => open()}>
                        Sign in to execute
                      </Button>
                    )
                  ) : null}
                </>
              ) : (
                <>
                  <h2>Return your plots</h2>
                  <p>
                    Select your plots, approve once, then return them together.
                    Each plot goes to the Exodus DAO and its minting cost in MANA
                    arrives in your wallet in the same transaction.
                  </p>
                </>
              )}

              {!isConnected ? (
                <div className="empty">
                  <Button primary onClick={() => open()}>
                    Sign in to see your plots
                  </Button>
                </div>
              ) : mine.length === 0 ? (
                <div className="empty">This wallet holds no plots.</div>
              ) : (
                <>
                  <div className="plots">
                    {mine.map((p) => {
                      const [x, y] = toCoords(p.id);
                      const canSelect = isActive && !p.returned && p.amount !== undefined;
                      return (
                        <label key={p.id} className={`plot ${canSelect ? "" : "disabled"}`}>
                          <input
                            type="checkbox"
                            disabled={!canSelect || isBusy}
                            checked={selected.has(p.id)}
                            onChange={() => toggle(p.id)}
                          />
                          <span className="name">
                            Parcel {x},{y} <small>TOWN #{p.id}</small>
                          </span>
                          <span className="amount">
                            {p.returned
                              ? "Returned"
                              : p.amount !== undefined
                              ? `${mana(p.amount)} MANA`
                              : "Not in the snapshot"}
                          </span>
                          <Link to={`/tokens/${p.id}`}>Edit</Link>
                        </label>
                      );
                    })}
                  </div>
                  {isActive && returnable.length > 0 ? (
                    <div className="actions">
                      <Button
                        basic
                        disabled={isBusy}
                        onClick={() =>
                          setSelected(
                            chosen.length === returnable.length
                              ? new Set()
                              : new Set(returnable.map((p) => p.id))
                          )
                        }
                      >
                        {chosen.length === returnable.length ? "Clear" : "Select all"}
                      </Button>
                      {isApproved ? (
                        <Button
                          primary
                          loading={isBusy}
                          disabled={isBusy || chosen.length === 0}
                          onClick={returnPlots}
                        >
                          Return {chosen.length || ""} for {mana(chosenTotal)} MANA
                        </Button>
                      ) : (
                        <Button primary loading={isBusy} disabled={isBusy} onClick={approve}>
                          Approve returns
                        </Button>
                      )}
                    </div>
                  ) : null}
                </>
              )}
              {message ? <div className="error">{message}</div> : null}
            </section>

            <aside className="card">
              <p className="eyebrow">WHAT UNWINDING MEANS</p>
              <h3>One plot. Its minting cost.</h3>
              <ul>
                <li>The right to return a plot travels with the TOWN NFT: whoever holds it can hand it back.</li>
                <li>Each plot returns the MANA it sold for at auction, from a snapshot of every settled auction.</li>
                <li>Returned plots go to the Exodus DAO, and each plot can be returned once.</li>
                <li>
                  The archive keeps each plot's owner as of a snapshot taken when the proposal
                  passed. That owner can still edit and publish the plot's content, even after
                  returning it.
                </li>
                <li>There is no deadline.</li>
              </ul>
              <p className="links">
                <a href={`${config.get("BLOCK_EXPLORER_URL")}/tx/${PROPOSAL_TRANSACTION}`} target="_blank">
                  Proposal transaction ↗
                </a>
                <a href={getContractUrl(REFUND_CONTRACT_ADDRESS)} target="_blank">
                  Refund contract ↗
                </a>
                <a href="https://github.com/exodus-town/refund" target="_blank">
                  Source and snapshot ↗
                </a>
              </p>
            </aside>
          </div>
        </Container>
      </div>
    </>
  );
});
