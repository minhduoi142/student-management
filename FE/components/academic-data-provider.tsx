"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { catalogService, studentService } from "@/services"
import type {
  GiangVienResponse,
  HocKyResponse,
  KhoaResponse,
  LopResponse,
  MonHocResponse,
  SinhVienResponse,
} from "@/services/types"

export type CatalogResource = "lop" | "khoa" | "mon-hoc" | "giang-vien" | "hoc-ky"
export type CatalogRecord =
  | LopResponse
  | KhoaResponse
  | MonHocResponse
  | GiangVienResponse
  | HocKyResponse

export type CatalogList = {
  lop: LopResponse[]
  khoa: KhoaResponse[]
  "mon-hoc": MonHocResponse[]
  "giang-vien": GiangVienResponse[]
  "hoc-ky": HocKyResponse[]
}

type AcademicDataContextValue = {
  classes: LopResponse[]
  faculties: KhoaResponse[]
  courses: MonHocResponse[]
  lecturers: GiangVienResponse[]
  semesters: HocKyResponse[]
  students: SinhVienResponse[]
  catalogs: CatalogList
  loading: boolean
  activeTranscriptStudentId: string | null
  setActiveTranscriptStudentId: (studentId: string | null) => void
  refreshCatalogs: () => Promise<void>
  refreshStudents: () => Promise<void>
}

const AcademicDataContext = createContext<AcademicDataContextValue | null>(null)

export function AcademicDataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<LopResponse[]>([])
  const [faculties, setFaculties] = useState<KhoaResponse[]>([])
  const [courses, setCourses] = useState<MonHocResponse[]>([])
  const [lecturers, setLecturers] = useState<GiangVienResponse[]>([])
  const [semesters, setSemesters] = useState<HocKyResponse[]>([])
  const [students, setStudents] = useState<SinhVienResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTranscriptStudentId, setActiveTranscriptStudentId] = useState<string | null>(null)

  const refreshCatalogs = useCallback(async () => {
    try {
      const [facultiesRes, classesRes, coursesRes, semestersRes, lecturersRes] =
        await Promise.allSettled([
          catalogService.getAllKhoa(),
          catalogService.getAllLop(),
          catalogService.getAllMonHoc(),
          catalogService.getAllHocKy(),
          catalogService.getAllGiangVien(),
        ])

      if (facultiesRes.status === "fulfilled") setFaculties(facultiesRes.value || [])
      if (classesRes.status === "fulfilled") setClasses(classesRes.value || [])
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value || [])
      if (semestersRes.status === "fulfilled") setSemesters(semestersRes.value || [])
      if (lecturersRes.status === "fulfilled") setLecturers(lecturersRes.value || [])
    } catch {
      // Gracefully handle if backend is not yet started
    }
  }, [])

  const refreshStudents = useCallback(async () => {
    try {
      const res = await studentService.getStudents({ size: 100, page: 0 })
      if (res && res.content) {
        setStudents(res.content)
      }
    } catch {
      // Gracefully handle if backend is not yet started
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const initData = async () => {
      setLoading(true)
      try {
        await Promise.all([refreshCatalogs(), refreshStudents()])
      } catch {
        // Silently catch to avoid triggering Next.js dev overlay
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initData()
    return () => {
      mounted = false
    }
  }, [refreshCatalogs, refreshStudents])

  const catalogs = useMemo<CatalogList>(
    () => ({
      lop: classes,
      khoa: faculties,
      "mon-hoc": courses,
      "giang-vien": lecturers,
      "hoc-ky": semesters,
    }),
    [classes, courses, faculties, lecturers, semesters]
  )

  const value = useMemo<AcademicDataContextValue>(
    () => ({
      classes,
      faculties,
      courses,
      lecturers,
      semesters,
      students,
      catalogs,
      loading,
      activeTranscriptStudentId,
      setActiveTranscriptStudentId,
      refreshCatalogs,
      refreshStudents,
    }),
    [
      classes,
      faculties,
      courses,
      lecturers,
      semesters,
      students,
      catalogs,
      loading,
      activeTranscriptStudentId,
      refreshCatalogs,
      refreshStudents,
    ]
  )

  return <AcademicDataContext.Provider value={value}>{children}</AcademicDataContext.Provider>
}

export function useAcademicData() {
  const context = useContext(AcademicDataContext)
  if (!context) {
    throw new Error("useAcademicData phải được gọi bên trong AcademicDataProvider")
  }
  return context
}
