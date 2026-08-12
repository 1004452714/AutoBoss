/** 战斗参数 */
export interface FightParam {
  timeout: number
  strategyName: string
}

/** 刷取模式 */
export type FarmMode = '一次性' | '一次性-每日限量' | '每日重置'

/** Boss 配置条目 */
export interface BossConfig {
  name: string
  totalCount: number
  remainingCount: number
  team: string
  returnToStatueAfterEachRound: boolean
  farmMode: FarmMode
  lastFarmTime: string | null
  dailyLimitCount: number
  dailyRemainingCount: number
  fightParam: FightParam
}

/** Boss 级联数据：区域 → Boss 名称列表 */
export interface BossCascadeData {
  bossList: Record<string, string[]>
  unsupportedBosses: string[]
}

/** 策略文件树节点 */
export interface StrategyNode {
  name: string
  type: 'folder' | 'file'
  children?: StrategyNode[]
}

/** 策略子目录加载结果 */
export interface StrategyChildrenData {
  path: string
  children: StrategyNode[]
}

/** htmlMask 消息结构 */
export interface HtmlMaskMessage {
  url: string
  data?: unknown
}

/** 默认 Boss 配置模板 */
export function createDefaultBossConfig(): BossConfig {
  return {
    name: '急冻树',
    totalCount: 20,
    remainingCount: 20,
    team: '不切换',
    returnToStatueAfterEachRound: false,
    farmMode: '一次性-每日限量',
    lastFarmTime: null,
    dailyLimitCount: 1,
    dailyRemainingCount: 1,
    fightParam: {
      timeout: 240,
      strategyName: '根据队伍自动选择',
    },
  }
}
