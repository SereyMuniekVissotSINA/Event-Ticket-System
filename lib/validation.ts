type ValidationResult<T> = {
  errors: string[]
  value: T | null
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toPositiveInteger(value: unknown) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

function toNonNegativeNumber(value: unknown) {
  const parsed = Number(value)

  if (Number.isNaN(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

export function validateRegisterInput(payload: unknown): ValidationResult<{ name: string; email: string; password: string }> {
  const body = payload as Record<string, unknown>
  const name = toTrimmedString(body?.name)
  const email = toTrimmedString(body?.email).toLowerCase()
  const password = toTrimmedString(body?.password)
  const errors: string[] = []

  if (!name) errors.push('name is required')
  if (!email) errors.push('email is required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email must be valid')
  if (!password) errors.push('password is required')

  return { errors, value: errors.length ? null : { name, email, password } }
}

export function validateLoginInput(payload: unknown): ValidationResult<{ email: string; password: string }> {
  const body = payload as Record<string, unknown>
  const email = toTrimmedString(body?.email).toLowerCase()
  const password = toTrimmedString(body?.password)
  const errors: string[] = []

  if (!email) errors.push('email is required')
  if (!password) errors.push('password is required')

  return { errors, value: errors.length ? null : { email, password } }
}

export function validateEventInput(payload: unknown, partial = false): ValidationResult<Record<string, unknown>> {
  const body = payload as Record<string, unknown>
  const errors: string[] = []
  const value: Record<string, unknown> = {}

  const title = toTrimmedString(body?.title)
  const date = toTrimmedString(body?.date)
  const seatCapacity = body?.seatCapacity === undefined ? null : toPositiveInteger(body?.seatCapacity)
  const price = body?.price === undefined ? null : toNonNegativeNumber(body?.price)
  const vipSeatCapacity = body?.vipSeatCapacity === undefined ? 0 : toNonNegativeNumber(body?.vipSeatCapacity)
  const vipPrice = body?.vipPrice === undefined ? 0 : toNonNegativeNumber(body?.vipPrice)

  if (!partial || body?.title !== undefined) {
    if (!title) errors.push('title is required')
    else value.title = title
  }

  if (body?.description !== undefined) value.description = toTrimmedString(body?.description)
  if (body?.category !== undefined) value.category = toTrimmedString(body?.category)
  if (body?.venue !== undefined) value.venue = toTrimmedString(body?.venue)
  if (!partial || body?.date !== undefined) {
    if (!date || Number.isNaN(Date.parse(date))) errors.push('date is required and must be valid')
    else value.date = new Date(date)
  }

  if (body?.time !== undefined) value.time = toTrimmedString(body?.time)

  if (body?.imageUrl !== undefined) {
    const imageUrl = toTrimmedString(body?.imageUrl)
    value.imageUrl = imageUrl || null
  }

  if (!partial || body?.seatCapacity !== undefined) {
    if (seatCapacity === null) errors.push('seatCapacity must be greater than 0')
    else value.seatCapacity = seatCapacity
  }

  if (!partial || body?.price !== undefined) {
    if (price === null) errors.push('price must not be negative')
    else value.price = price
  }

  if (body?.vipSeatCapacity !== undefined) {
    if (vipSeatCapacity === null) errors.push('vipSeatCapacity must not be negative')
    else value.vipSeatCapacity = vipSeatCapacity
  }

  if (body?.vipPrice !== undefined) {
    if (vipPrice === null) errors.push('vipPrice must not be negative')
    else value.vipPrice = vipPrice
  }

  return { errors, value: errors.length ? null : value }
}

export function validateBookingInput(payload: unknown): ValidationResult<{ eventId: string; quantity: number; ticketType?: 'standard' | 'vip'; seatNumber?: string }> {
  const body = payload as Record<string, unknown>
  const eventId = toTrimmedString(body?.eventId)
  const quantity = toPositiveInteger(body?.quantity)
  const ticketType = (body?.ticketType === 'vip' ? 'vip' : 'standard') as 'standard' | 'vip'
  const seatNumber = body?.seatNumber ? toTrimmedString(body?.seatNumber) : undefined
  const errors: string[] = []

  if (!eventId) errors.push('eventId is required')
  if (quantity === null) errors.push('quantity must be greater than 0')

  return { errors, value: errors.length ? null : { eventId, quantity: quantity ?? 0, ticketType, seatNumber } }
}

export function validateDateFilter(value: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}