import { ApiPromise } from '@polkadot/api';
import { UnsubscribePromise, VoidFn } from '@polkadot/api-base/types';
import { HYDRADX_OMNIPOOL_ADDRESS } from '../consts';
import { PoolBase, PoolFees, PoolType } from '../types';
import { BigNumber } from '../utils/bignumber';

import { BalanceClient } from '../client';

export abstract class PoolClient extends BalanceClient {
  protected pools: PoolBase[] = [];
  protected subs: VoidFn[] = [];
  private poolsLoaded = false;

  constructor(api: ApiPromise) {
    super(api);
  }

  protected abstract loadPools(): Promise<PoolBase[]>;
  abstract getPoolType(): PoolType;
  abstract getPoolFees(feeAsset: string, address: string): Promise<PoolFees>;
  protected abstract subscribePoolChange(pool: PoolBase): UnsubscribePromise;

  async getPools(): Promise<PoolBase[]> {
    if (this.poolsLoaded) {
      return this.pools;
    }
    this.pools = await this.loadPools();
    this.subs = await this.subscribe();
    this.poolsLoaded = true;
    return this.pools;
  }

  async subscribe() {
    const subs = this.pools.map(async (pool: PoolBase) => {
      const poolSubs = [
        await this.subscribePoolChange(pool),
        await this.subscribeTokensPoolBalance(pool),
        await this.subscribeSystemPoolBalance(pool),
      ];

      if (this.hasShareAsset(pool)) {
        const sub = await this.subscribeSharePoolBalance(pool);
        poolSubs.push(sub);
      }
      this.subscribeLog(pool);
      return poolSubs;
    });

    const subsriptions = await Promise.all(subs);
    return subsriptions.flat();
  }

  private subscribeLog(pool: PoolBase) {
    const poolAddr = pool.address.substring(0, 10).concat('...');
    console.log(`${pool.type} [${poolAddr}] balance subscribed`);
  }

  unsubscribe() {
    this.subs.forEach((unsub) => {
      unsub();
    });
  }

  private hasShareAsset(pool: PoolBase) {
    return pool.type === PoolType.Stable && pool.id;
  }

  private subscribeTokensPoolBalance(pool: PoolBase): UnsubscribePromise {
    return this.subscribeTokenBalance(
      pool.address,
      pool.tokens.map((t) => t.id),
      this.updateBalanceCallback(pool, (p, t) => p.id !== t)
    );
  }

  private subscribeSharePoolBalance(pool: PoolBase): UnsubscribePromise {
    return this.subscribeTokenBalance(
      HYDRADX_OMNIPOOL_ADDRESS,
      [pool.id!],
      this.updateBalanceCallback(pool, () => true)
    );
  }

  private subscribeSystemPoolBalance(pool: PoolBase): UnsubscribePromise {
    return this.subscribeSystemBalance(
      pool.address,
      this.updateBalanceCallback(pool, () => true)
    );
  }

  private updateBalanceCallback(
    pool: PoolBase,
    canUpdate: (pool: PoolBase, token: string) => boolean
  ) {
    return function (token: string, balance: BigNumber) {
      const tokenIndex = pool.tokens.findIndex((t) => t.id == token);
      if (tokenIndex >= 0 && canUpdate(pool, token)) {
        pool.tokens[tokenIndex].balance = balance.toString();
      }
    };
  }
}
