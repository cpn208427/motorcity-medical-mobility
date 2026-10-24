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

- Keep appointment timing and fallback calculations in a browser-safe transit-plan helper so the planner, messages, and tests share one arrival rule.
- Treat bus intervals and durations as sample data until live service is connected; never present fallback arrival as a verified guarantee.
- Do not send patient details to shared calendars without authenticated access and authorized-recipient controls; a calendar connection alone is not authorization.
