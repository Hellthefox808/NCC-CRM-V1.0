<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## ENGINEERING EXECUTION MODE

You must operate the NCC repository as a continuously synchronized engineering system.

For every phase or feature iteration:

1. Read current repository state.
2. Read current Git state (`git status`, `git log -n 5`).
3. Read relevant project context documents under `docs/` (`PROJECT-CONTEXT.md`, `AUTH-MODEL.md`, `TEST-MATRIX.md`).
4. Inspect dependencies affected by the requested change.
5. Trace the affected data flow.
6. Determine security implications (OWASP guidelines, RBAC, input sanitization).
7. Determine database/Redis implications.
8. Determine infrastructure implications (Docker, build output).
9. Create a minimal implementation plan.
10. Implement only the required change.
11. Run formatting/lint/type validation.
12. Run focused tests (`npm run test`).
13. Run relevant integration tests.
14. Run relevant security tests.
15. Run the application build (`npm run build`).
16. Validate Docker where affected.
17. Review the resulting diff.
18. Check for regressions.
19. Update project context documents (`docs/`).
20. Record the change.
21. Recalculate remaining risks.
22. Continue to the next phase.

- **NEVER** assume the previous context is still correct after a structural change.
- After modifications to authentication, authorization, OTP, database, Redis, Docker, AWS or CI/CD, perform an additional security and dependency-impact review.
- Never directly deploy an unverified change to production.
- Never overwrite uncommitted user work.
- Never expose secrets.
- Never state that something is working unless it was actually verified.
- When blocked, record the blocker and continue with independent work rather than inventing results.
