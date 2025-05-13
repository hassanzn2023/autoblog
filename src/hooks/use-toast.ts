
import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToastProps = React.ComponentPropsWithoutRef<typeof Sonner>

interface ToastActionElement {
  altText?: string
  onClick?: () => void
  children: React.ReactNode
}

export type ToastVariants = 'default' | 'destructive' | 'success' | 'warning'

export interface ToastParams {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: ToastVariants
  duration?: number
}

interface ToastState {
  toasts: ToasterToast[]
  add: (data: ToastParams) => void
  update: (id: string, data: ToastParams) => void
  dismiss: (id: string) => void
  remove: (id: string) => void
}

export interface ToasterToast extends ToastParams {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: ToasterToast[], action: Action): ToasterToast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [...state, action.toast]
    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )
    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId === undefined) {
        return state.map((t) => ({
          ...t,
          open: false,
        }))
      }

      return state.map((t) =>
        t.id === toastId ? { ...t, open: false } : t
      )
    }
    case "REMOVE_TOAST": {
      const { toastId } = action

      if (toastId === undefined) {
        return []
      }

      return state.filter((t) => t.id !== toastId)
    }
  }
}

export const useToast = (): ToastState => {
  const [state, dispatch] = React.useReducer(reducer, [])

  React.useEffect(() => {
    return () => {
      for (const [, timeout] of toastTimeouts) {
        clearTimeout(timeout)
      }
    }
  }, [])

  const add = React.useCallback((toast: ToastParams) => {
    const id = crypto.randomUUID()

    const dismissToast = () => {
      dispatch({
        type: "DISMISS_TOAST",
        toastId: id,
      })

      window.setTimeout(() => {
        dispatch({
          type: "REMOVE_TOAST",
          toastId: id,
        })
      }, 1000)
    }

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...toast,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismissToast()
        },
      },
    })

    return {
      id,
      dismiss: () => dismissToast(),
      update: (props: ToastParams) =>
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id },
        }),
    }
  }, [])

  const update = React.useCallback(
    (id: string, toast: ToastParams) => {
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...toast, id },
      })
    },
    []
  )

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  }, [])

  const remove = React.useCallback((toastId?: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, [])

  return {
    toasts: state,
    add,
    update,
    dismiss,
    remove,
  }
}

export function toast(props: ToastParams) {
  const { add } = useToast()
  return add(props)
}

export type { ToastProps }
