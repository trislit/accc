import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { tokenLabel } from "@/lib/project";

const sections = [
  { id: "thesis", label: "Thesis" },
  { id: "join", label: "How you join" },
  { id: "accrual", label: "Accrual" },
  { id: "buyback", label: "33% buyback" },
  { id: "tools", label: "Tools" },
  { id: "roadmap", label: "Roadmap" },
  { id: "ask", label: "The ask" },
] as const;

export function PlanView() {
  const token = tokenLabel();

  return (
    <div className="mx-auto max-w-3xl space-y-16">
      <header className="space-y-4">
        <p className="text-sm font-medium text-forge-green">
          Anti-Cabal Cabal Club · plan
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Membership that earns. Tools that buy it back.
        </h1>
        <p className="text-base text-text-secondary">
          Buy an ACCC NFT. Keep {token} in its account and it accrues. We build
          the launch stack we wish we had — then sell that stack. One third of
          tool revenue buys {token} on the open market for people still earning.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/mint/">
            <Button>Mint</Button>
          </Link>
          <Link href="/collection/">
            <Button variant="secondary">View collection</Button>
          </Link>
        </div>
      </header>

      <nav className="sticky top-16 z-30 -mx-4 border-y border-border-subtle bg-bg px-4 py-3 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
        <div className="mx-auto flex max-w-3xl gap-5 overflow-x-auto">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 text-sm text-text-secondary hover:text-text-primary"
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="thesis" className="scroll-mt-36 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat value="NFT Account" label="Membership is an onchain account" />
          <Stat value="10% APY" label={`On remaining original ${token}`} />
          <Stat value="33%" label={`Tool revenue to open-market ${token} buybacks`} />
        </div>
        <h2 className="text-2xl font-semibold">The cabal problem</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Crypto still runs on closed circles: allocation lists, private launch
          infra, and tooling that only insiders get. Independent teams ship
          slower, raise worse, and get farmed by groups that already own the
          rails.
        </p>
        <p className="text-sm leading-7 text-text-secondary">
          ACCC is a club that funds the opposite. Members hold a membership NFT
          whose account can earn {token}. The club builds launch tools for
          itself first, then licenses them so other projects can compete without
          asking a cabal for permission.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Note title="Entrenched path">
            Warm intros, insider allocations, closed dashboards, extractive
            market-making. Value concentrates in the same wallets every cycle.
          </Note>
          <Note title="ACCC path">
            Public membership. Principal that earns if you leave it in the NFT.
            Shared launch tools. Buybacks so tool customers pay the people who
            stayed.
          </Note>
        </div>
      </section>

      <section id="join" className="scroll-mt-36 space-y-4">
        <h2 className="text-2xl font-semibold">How you get involved</h2>
        <p className="text-sm text-text-secondary">
          One loop. The NFT is the seat. The token in that seat is the stake.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Step</th>
                <th className="px-4 py-3 font-medium">What you do</th>
                <th className="px-4 py-3 font-medium">What you get</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <Row
                step="1. Buy or mint"
                action="Mint genesis or buy an ACCC NFT."
                result="An ERC-6551 NFT Account you control."
              />
              <Row
                step="2. Claim once"
                action={`Claim 1,000 ${token} into that NFT Account.`}
                result="Original principal. One grant per NFT, forever."
              />
              <Row
                step="3. Accrue"
                action="Leave that grant in the NFT. Harvest when you want it."
                result="10% APY on remaining original principal only."
              />
              <Row
                step="4. Stay or exit"
                action="Withdraw cuts earning power. Sending tokens back in does not restore it."
                result="Only holders who keep the grant keep the yield."
              />
              <Row
                step="5. Ride buybacks"
                action={`As tools produce revenue, 33% buys ${token} on the open market.`}
                result="Demand hits the same token still sitting in NFT Accounts."
              />
            </tbody>
          </table>
        </div>
        <p className="rounded-lg border border-border bg-surface-1 p-4 text-sm text-text-secondary">
          Live on Robinhood Chain testnet: claim is once per NFT, yield tracks
          remaining original 1,000, and withdrawals ratchet principal down
          permanently.
        </p>
      </section>

      <section id="accrual" className="scroll-mt-36 space-y-4">
        <h2 className="text-2xl font-semibold">Why the mechanic is the marketing</h2>
        <p className="text-sm leading-7 text-text-secondary">
          Most member tokens leak. People claim, dump, and still expect upside.
          ACCC only pays the original grant that is still sitting in the NFT.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Note title="Leave 1,000 in">
            Earn 10% APY on 1,000. Harvest does not raise principal.
          </Note>
          <Note title="Withdraw 200">
            Earn on 800. Same rate, smaller base.
          </Note>
          <Note title="Empty the account">
            Earning principal goes to 0. Transferring {token} back in never
            restores it.
          </Note>
        </div>
        <div>
          <h3 className="text-base font-semibold">Modeled yearly yield</h3>
          <p className="mt-1 text-xs text-text-muted">
            10% APY · 365-day year · remaining original principal only
          </p>
          <div className="mt-4 space-y-3">
            <Meter label="1,000 left" value="100 $ACCC / year" pct={100} />
            <Meter label="800 left" value="80 $ACCC / year" pct={80} />
            <Meter label="500 left" value="50 $ACCC / year" pct={50} />
            <Meter label="0 left" value="0 $ACCC / year" pct={0} />
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Buybacks do not change this formula. They add bid on the open market
            for the same {token} that earning NFTs still hold.
          </p>
        </div>
      </section>

      <section id="buyback" className="scroll-mt-36 space-y-4">
        <h2 className="text-2xl font-semibold">33% of tool revenue buys {token}</h2>
        <p className="text-sm leading-7 text-text-secondary">
          The club is not asking members to believe. Tool customers — first us,
          then other teams — pay for software. A fixed 33% of that revenue is
          spent buying {token} on the open market. No insider OTC. No treasury
          unlock theater.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-base font-semibold">Revenue split (policy)</h3>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-[33%] bg-forge-green" />
            </div>
            <div className="mt-3 space-y-1 text-sm text-text-secondary">
              <p>
                <span className="font-medium text-text-primary">33%</span>{" "}
                open-market {token} buybacks
              </p>
              <p>
                <span className="font-medium text-text-primary">67%</span> build,
                host, and operate tools
              </p>
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Policy target, not a live P&L. 67% keeps the tools shipping.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold">Who the bid is for</h3>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Buybacks hit liquid {token}. Members who emptied their NFT already
              sold their earning seat. Members who still hold original principal
              keep accruing into an asset the club is programmed to bid for.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <Row
                step="Mint / buy ACCC NFT"
                action={`Claim 1,000 ${token} into the NFT Account`}
                result="Creates earning principal"
              />
              <Row
                step="Leave principal in"
                action="10% APY harvest"
                result="Rewards staying, not circulating"
              />
              <Row
                step="Ship and sell launch tools"
                action="Cash revenue"
                result="Independent of token emissions"
              />
              <Row
                step="33% of revenue"
                action={`Open-market buy ${token}`}
                result="Bid under earning accounts"
              />
            </tbody>
          </table>
        </div>
      </section>

      <section id="tools" className="scroll-mt-36 space-y-4">
        <h2 className="text-2xl font-semibold">
          Build the stack we need. Then rent it out.
        </h2>
        <p className="text-sm leading-7 text-text-secondary">
          The tools exist so we can launch without a cabal — membership NFTs,
          token accounts, claims, yield, markets, later liquidity and
          distribution. Once that stack works on ACCC, other teams get the same
          rails.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Note title="Phase A — Ourselves">
            Launch ACCC end-to-end: mint, NFT Accounts, {token} distribution,
            portfolio, later listing and liquidity. We eat the bugs. Members
            see a real club, not a whitepaper factory.
          </Note>
          <Note title="Phase B — Others">
            Package the same rails for independent teams. They pay for software.
            They do not give up allocation to an inner circle. 33% of that spend
            buys {token}.
          </Note>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Cabal advantage today</th>
                <th className="px-4 py-3 font-medium">ACCC tool answer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr>
                <td className="px-4 py-3 text-text-secondary">
                  Private launch dashboards and allowlists
                </td>
                <td className="px-4 py-3">
                  Public mint + NFT Account as the member seat
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-secondary">
                  Insider token emissions
                </td>
                <td className="px-4 py-3">
                  One genesis grant per NFT; yield only if it stays put
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-secondary">
                  Closed market-making relationships
                </td>
                <td className="px-4 py-3">
                  Transparent buybacks from real tool revenue
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-secondary">
                  You need their stack to ship
                </td>
                <td className="px-4 py-3">
                  Same factory ACCC uses, sold as a product
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="rounded-lg border border-border bg-surface-1 p-4 text-sm text-text-secondary">
          We are not anti-market. We are anti-closed-rails. Anyone can buy a
          membership. Anyone can keep principal in the NFT. Anyone can later
          license the tools. The club captures value when those tools get used.
        </p>
      </section>

      <section id="roadmap" className="scroll-mt-36 space-y-4">
        <h2 className="text-2xl font-semibold">Go-to-market sequence</h2>
        <p className="text-sm text-text-secondary">
          Do not sell a meta-factory before ACCC itself looks inevitable. Prove
          the club, then export the machine.
        </p>
        <div className="space-y-3">
          <Meter label="0. Live club" value="Now" pct={90} />
          <Meter label="1. Public story" value="Next" pct={40} />
          <Meter label="2. Our launch stack" value="Then" pct={25} />
          <Meter label="3. Tools for others" value="After ACCC is real" pct={10} />
          <Meter label="4. Buyback engine" value="With first revenue" pct={5} />
        </div>
        <p className="text-xs text-text-muted">
          Bars are a planning score, not a KPI. Phase 0 is live on Robinhood
          testnet; later phases are still to build.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Phase</th>
                <th className="px-4 py-3 font-medium">Ship</th>
                <th className="px-4 py-3 font-medium">Why it markets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr>
                <td className="px-4 py-3 font-medium">0. Live club</td>
                <td className="px-4 py-3 text-text-secondary">
                  NFT Accounts, 1,000 {token} claim, 10% on remaining principal.
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  The mechanic is demoable today.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">1. Public story</td>
                <td className="px-4 py-3 text-text-secondary">
                  This page, member UX that shows earning principal.
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  Buy → leave it in → earn, before any tool SaaS exists.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">2. Our launch stack</td>
                <td className="px-4 py-3 text-text-secondary">
                  Liquidity path, listings, ops to run ACCC as a real project.
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  Proof we can launch without a cabal because we already did.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">3. Tools for others</td>
                <td className="px-4 py-3 text-text-secondary">
                  Productize mint, accounts, claims, yield, launch surfaces.
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  Revenue starts. Independent teams get the rails.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">4. Buyback engine</td>
                <td className="px-4 py-3 text-text-secondary">
                  Attested 33% buybacks, public reporting, wallet of record.
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  Accruing NFTs sit in front of a real bid.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="ask" className="scroll-mt-36 space-y-4">
        <h2 className="text-2xl font-semibold">Who this is for</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Note title="Members">
            Buy or mint ACCC. Claim once. Leave the grant in the NFT if you want
            the yield and the buyback bid.
          </Note>
          <Note title="Builders">
            Use the same launch stack ACCC uses. Pay for software instead of
            paying an inner circle for access.
          </Note>
          <Note title="Allies">
            Help ship liquidity, tool packaging, and a buyback path that can be
            audited.
          </Note>
        </div>
        <p className="rounded-lg border border-forge-green/40 bg-forge-green-muted/20 p-4 text-sm text-text-primary">
          ACCC is a membership NFT that earns {token} if you keep the original
          grant in it. We build launch tools so we — and then anyone — can
          compete with closed crypto clubs. 33% of what those tools earn buys{" "}
          {token} on the open market.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Proof</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr>
                <td className="px-4 py-3">
                  One claim per NFT, tokens land in the NFT Account
                </td>
                <td className="px-4 py-3 text-forge-green">Live (testnet)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  10% APY on remaining original principal only
                </td>
                <td className="px-4 py-3 text-forge-green">Live (testnet)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  Withdrawals permanently cut earning power
                </td>
                <td className="px-4 py-3 text-forge-green">Live (testnet)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">This public plan page</td>
                <td className="px-4 py-3 text-forge-green">Live</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Launch stack used on ACCC itself</td>
                <td className="px-4 py-3 text-text-muted">Planned</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Tools sold to other teams</td>
                <td className="px-4 py-3 text-text-muted">Planned</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  33% revenue → open-market {token} buybacks
                </td>
                <td className="px-4 py-3 text-text-muted">Policy, not shipped</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Link href="/mint/">
          <Button size="lg">Mint a membership</Button>
        </Link>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <p className="tabular text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{children}</p>
    </div>
  );
}

function Row({
  step,
  action,
  result,
}: {
  step: string;
  action: string;
  result: string;
}) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium">{step}</td>
      <td className="px-4 py-3 text-text-secondary">{action}</td>
      <td className="px-4 py-3 text-text-secondary">{result}</td>
    </tr>
  );
}

function Meter({
  label,
  value,
  pct,
}: {
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular text-text-secondary">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface-3">
        <div
          className="h-2 rounded-full bg-forge-green"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
