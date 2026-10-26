export * from "@/services/types"

export function calculateFinalGrade(diemCC: number, diemGK: number, diemCK: number) {
  return Number((diemCC * 0.1 + diemGK * 0.3 + diemCK * 0.6).toFixed(2))
}
