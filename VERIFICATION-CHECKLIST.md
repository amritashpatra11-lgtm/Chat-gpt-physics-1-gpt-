# Verification checklist

## Functional

- [ ] Home page loads and featured laboratories open.
- [ ] Search finds simulations by title, topic, description, and equation.
- [ ] Category filtering works for all nine topic groups.
- [ ] All 100 cards open a laboratory.
- [ ] Pause, restart, and slow-motion controls work.
- [ ] Sliders and numerical inputs remain synchronized.
- [ ] Saved laboratories persist after reload.
- [ ] Theme and low-performance preferences persist after reload.
- [ ] Direct hashes such as `#lab/5-projectile-motion` reopen the correct laboratory.
- [ ] Service worker makes previously visited files available offline.

## Performance and low-end-device checks

Run these manually in Chrome DevTools:

1. Open **Performance** and select 4× CPU slowdown. Repeat with 6× slowdown.
2. Open **Network** and select **Slow 3G** with cache disabled for the first run.
3. Confirm that the shell is visible quickly and catalogue interactions become usable within a few seconds.
4. Confirm simulator modules load only after a card is opened.
5. Enable **Low performance mode** and verify:
   - Render target changes to 30 FPS.
   - Canvas device-pixel ratio is reduced.
   - Trail/graph sample counts decrease.
   - Shadows, blur, and animated transitions are removed.
6. Switch to another browser tab and verify animation CPU usage stops; return and verify it resumes.
7. Record a 30-second performance trace and verify there is no full-page DOM update per frame.
8. Test touch controls at 360 × 640, 412 × 915, and 768 × 1024 viewports.
9. Test offline reload after one successful online visit.
10. Test an older Android Chrome/WebView if available.

## Accessibility

- [ ] Keyboard navigation reaches cards, controls, and navigation.
- [ ] Visible focus indicators appear.
- [ ] Text maintains usable contrast in dark and light themes.
- [ ] Canvas has an accessible label and important values are duplicated as text metrics.
- [ ] Reduced-motion preference suppresses nonessential transitions.
