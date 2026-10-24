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
- Model sample journeys as ordered walking, riding, and waiting legs; derive total duration and both departure timelines from those legs so transfer waits and entrance walks cannot be omitted.
- Keep the verified hospital destination roster and source addresses in one browser-safe data module, separate from illustrative transit timing; destination availability does not establish bus coverage.
- Treat bus intervals and durations as sample data until live service is connected; never present fallback arrival as a verified guarantee.
- Do not send patient details to shared calendars without authenticated access and authorized-recipient controls; a calendar connection alone is not authorization.
- Keep official bus trackers as external no-referrer links because agency pages restrict embedding; do not label the illustrative planner map or fallback times as live data.
