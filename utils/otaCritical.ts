/** Force only when the running bundle is older than the minimum AND a newer one exists — the second half is what stops a reload loop. */
export function shouldForce(available: boolean, runningCreatedAt: Date | null, minCreatedAtMs: number | null): boolean {
    return available && minCreatedAtMs !== null && (runningCreatedAt?.getTime() ?? 0) < minCreatedAtMs;
}
