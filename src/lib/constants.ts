// Shared constants used across client and server

export const CONDITION_OPTIONS = [
    { id: 'cleaning', label: 'Cleaning', cost: 150, emoji: '🧹' },
    { id: 'painting', label: 'Painting', cost: 200, emoji: '🎨' },
    { id: 'holes', label: 'Holes/Damage', cost: 100, emoji: '🔨' },
    { id: 'flooring', label: 'Flooring', cost: 250, emoji: '🪵' },
] as const

export type ConditionId = typeof CONDITION_OPTIONS[number]['id']

export const TDS_SCHEMES = ['DPS', 'TDS', 'MyDeposits'] as const
export type TdsScheme = typeof TDS_SCHEMES[number]

export const SERVICE_FEE_RATE = 0.12
export const MIN_DEPOSIT_AMOUNT = 100

export function calculateOffer(depositAmount: number, conditions: string[]) {
    const estimatedRepairCost = conditions.reduce((total, id) => {
        const option = CONDITION_OPTIONS.find(o => o.id === id)
        return total + (option?.cost || 0)
    }, 0)

    const serviceFee = Math.round(depositAmount * SERVICE_FEE_RATE)
    const advanceAmount = Math.max(0, depositAmount - estimatedRepairCost - serviceFee)

    return { estimatedRepairCost, serviceFee, advanceAmount }
}

export const ROOM_TYPES = [
  { id: 'kitchen', label: 'Kitchen', tips: 'Show appliances, counters, cupboards, floor' },
  { id: 'bathroom', label: 'Bathroom', tips: 'Show taps, tiles, toilet, shower/bath, mirrors' },
  { id: 'bedroom', label: 'Bedroom(s)', tips: 'Show walls, carpet, windows, wardrobes' },
  { id: 'living_room', label: 'Living Room', tips: 'Show walls, floor, windows, fixtures' },
  { id: 'hallway', label: 'Hallway', tips: 'Show entrance, walls, floor, ceiling' },
  { id: 'exterior', label: 'Exterior/Garden', tips: 'Show front door, garden, bins area' },
] as const

export type RoomTypeId = typeof ROOM_TYPES[number]['id']
