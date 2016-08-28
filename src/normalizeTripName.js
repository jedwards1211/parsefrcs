export default function normalizeTripName(name) {
  return name.trim().substring(0, 80).replace(/\s+/g, ' ').toLowerCase().replace(/[^a-z0-9 ]/g, '_')
}
