"use client"

import { useEffect, useState } from "react"
import { recruitmentService } from "@/services/recruitment.service"

const DEFAULT_PERIOD = "2026/2027"

export function periodToYear(period: string): number {
  const year = Number.parseInt(period.split("/")[0], 10)
  return Number.isNaN(year) ? Number.parseInt(DEFAULT_PERIOD, 10) : year
}

export function useRecruitmentPeriods() {
  const [periods, setPeriods] = useState<string[]>([])
  const [activePeriod, setActivePeriod] = useState(DEFAULT_PERIOD)

  useEffect(() => {
    let isMounted = true

    recruitmentService
      .getPeriods()
      .then((response) => {
        if (!isMounted || response.status !== "success" || !response.data) return

        const nextPeriods = response.data.periods || [DEFAULT_PERIOD]
        setPeriods(nextPeriods)
        setActivePeriod(response.data.activePeriod || nextPeriods[0] || DEFAULT_PERIOD)
      })
      .catch((error) => {
        console.error("Gagal memuat periode pendaftaran:", error)
        if (isMounted) setPeriods([DEFAULT_PERIOD])
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { periods, activePeriod }
}
