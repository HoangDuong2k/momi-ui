/** Join space-separated id references (aria-describedby, aria-labelledby), dropping empty values. */
export function joinIds(...ids: Array<string | undefined | null | false>) {
  return ids.filter(Boolean).join(' ') || undefined
}
