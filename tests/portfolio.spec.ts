import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("welcome opens on every visit, guides visitors, and can be replayed", async ({
  page,
}) => {
  await page.goto("/");
  const welcome = page.getByRole("dialog", {
    name: "Welcome to Anant’s portfolio",
  });
  await expect(welcome).toBeVisible();
  await expect(
    welcome.getByRole("button", { name: /See what I build/ }),
  ).toBeFocused();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(accessibility.violations.map((violation) => violation.id)).toEqual([]);
  await welcome.getByRole("button", { name: /Break the network/ }).click();
  await expect(welcome).toHaveCount(0);
  await expect(page).toHaveURL(/#network$/);
  await expect(page.locator("#network")).toBeInViewport();
  await page.goto("/");
  await expect(welcome).toBeVisible();
  await welcome.getByRole("button", { name: /I’ll explore on my own/ }).click();
  await expect(welcome).toHaveCount(0);
  const replay = page.getByRole("button", { name: "Replay intro" });
  await replay.click();
  await expect(welcome).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(welcome).toHaveCount(0);
  await expect(replay).toBeFocused();
  await page.goto("/#work");
  await page.reload();
  await expect(welcome).toBeVisible();
  await welcome.getByRole("button", { name: /I’ll explore on my own/ }).click();
  await expect(page.locator("#work")).toBeInViewport();
  await page.goto("/?intro=0");
  await expect(welcome).toHaveCount(0);
  await page.goto("/?intro=1");
  await expect(welcome).toBeVisible();
  await welcome.getByRole("button", { name: /I’ll explore on my own/ }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("home navigation, project links and animation controls work", async ({
  page,
}) => {
  await page.goto("/?intro=0");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Interfaces",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "hold up",
  );
  await expect(page.getByText("ANANT SINGH /", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(
    page.getByRole("button", { name: "Play animations" }),
  ).toBeVisible();
  await expect(page.locator(".site")).toHaveClass(/motion-paused/);
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/#work/);
  await expect(
    page.getByRole("link", { name: "Explore Orbit project" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore Orbit project" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Orbit.");
  await expect(
    page.getByRole("link", { name: "Back to selected work" }),
  ).toHaveAttribute("href", "/#work");
});

test("public engineering work has source links and scroll progress", async ({
  page,
}) => {
  await page.goto("/?intro=0");
  await expect(
    page.getByRole("heading", { name: "The work goes deeper." }),
  ).toBeVisible();
  for (const [name, repo] of [
    ["Inspectra", "Inspectra-Frontend"],
    ["Raft", "raft"],
    ["PeerCDN", "PeerCDN"],
  ]) {
    await expect(
      page.getByRole("link", { name: `View ${name} source on GitHub` }),
    ).toHaveAttribute("href", `https://github.com/AnantSingh1510/${repo}`);
  }
  await expect(
    page.locator(".about-links").getByRole("link", { name: "LeetCode" }),
  ).toHaveAttribute("href", "https://leetcode.com/u/AnantSingh1510/");
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await expect
    .poll(() =>
      page
        .locator(".reading-progress")
        .evaluate((el) => parseFloat((el as HTMLElement).style.width)),
    )
    .toBeGreaterThan(95);
});

test("Pixel responds to play and remembers its coat", async ({ page }) => {
  await page.goto("/?intro=0");
  await page.getByRole("button", { name: "Meet Pixel companion" }).click();
  const studio = page.locator(".pixel-popover");
  await expect(
    studio.getByRole("heading", { name: "Meet Pixel." }),
  ).toBeVisible();
  await studio.getByRole("button", { name: "Pet Pixel the dog" }).click();
  await studio.getByRole("button", { name: "Treat", exact: false }).click();
  await expect(studio).toContainText("1 pets · 1 treats");
  await studio.getByRole("button", { name: "Nap", exact: false }).click();
  await expect(studio.getByRole("status")).toContainText("dreaming");
  await studio.getByRole("button", { name: "Wake", exact: false }).click();
  await studio.getByRole("button", { name: "Moss coat" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Meet Pixel companion" }).click();
  await expect(
    page.getByRole("button", { name: "Pet Pixel the roaming dog" }),
  ).toBeVisible();
  await expect(
    studio.getByRole("button", { name: "Moss coat" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(studio).toContainText("1 pets · 1 treats");
  await page.keyboard.press("Escape");
  await expect(studio).toHaveCount(0);
});

test("Pixel roams along the viewport and can be petted there", async ({
  page,
}) => {
  await page.goto("/?intro=0");
  const roamer = page.getByRole("button", {
    name: "Pet Pixel the roaming dog",
  });
  await expect(page.locator(".pixel-roamer-sprite")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".pixel-dog-frame.frame-0").first()).toHaveCSS(
    "animation-name",
    "pixel-frame-0",
  );
  const first = await roamer.boundingBox();
  expect(first).not.toBeNull();
  await expect.poll(async () => {
    const next = await roamer.boundingBox();
    return next ? Math.abs(next.x - first!.x) : 0;
  }, { timeout: 3000 }).toBeGreaterThan(5);
  expect(first!.y).toBeGreaterThan(0);
  await roamer.evaluate((button: HTMLButtonElement) => button.click());
  await page.getByRole("button", { name: "Meet Pixel companion" }).click();
  await expect(page.locator(".pixel-popover")).toContainText(
    "1 pets · 0 treats",
  );
});

test("network playground reroutes around failed links and traces transport behavior", async ({
  page,
}) => {
  await page.goto("/?intro=0#network");
  const lab = page.locator("#network");
  await expect(
    lab.getByRole("heading", { name: "Packets have a story." }),
  ).toBeVisible();
  await expect(lab.locator(".network-metrics")).toContainText(
    "CLIENT → EDGE → CORE → ORIGIN",
  );
  await lab
    .getByRole("button", { name: "Fail EDGE to CORE connection" })
    .click();
  await expect(lab.locator(".network-metrics")).not.toContainText(
    "CLIENT → EDGE → CORE → ORIGIN",
  );
  await lab.getByRole("button", { name: "Restore all links" }).click();
  await lab.getByRole("button", { name: "Star" }).click();
  await lab
    .getByRole("button", { name: "Fail CLIENT to CORE connection" })
    .click();
  await expect(lab.locator(".network-metrics")).toContainText("NO ROUTE");
  await lab.getByRole("button", { name: "Restore all links" }).click();
  await lab.getByRole("slider", { name: "Packet loss percentage" }).fill("80");
  await lab.getByRole("button", { name: "RUN SIMULATION" }).click();
  await expect(lab.locator(".network-log-lines")).toContainText("SYN-ACK");
  await expect(lab.locator(".network-log-lines")).toContainText("RETRY");
  await lab.getByRole("button", { name: "UDP", exact: false }).click();
  await lab.getByRole("button", { name: "RUN SIMULATION" }).click();
  await expect(lab.locator(".network-metrics")).toContainText("RETRANSMITS0");
  await expect(lab.locator(".network-log-lines")).not.toContainText("SYN-ACK");
});

test("3D study renders and its orbit and reset controls respond", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?intro=0#spatial");
  const study = page.locator("#spatial");
  await expect(
    study.getByRole("heading", { name: /See the system/ }),
  ).toBeVisible();
  await expect(study.locator("canvas")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(1000);
  await study.getByRole("button", { name: "PAUSE ORBIT" }).click();
  await expect(
    study.getByRole("button", { name: "AUTO ORBIT" }),
  ).toHaveAttribute("aria-pressed", "false");
  const bounds = await study.locator(".spatial-canvas").boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2 + 80,
    bounds!.y + bounds!.height / 2 + 30,
  );
  await page.mouse.up();
  await study.getByRole("button", { name: "Reset 3D view" }).click();
  expect(errors).toEqual([]);
});

test("quick finder opens from the keyboard and finds a project", async ({
  page,
}) => {
  await page.goto("/?intro=0");
  await page.keyboard.press("/");
  const finder = page.getByRole("dialog", { name: "Find your way" });
  await expect(finder).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search pages and projects" }),
  ).toBeFocused();
  await page
    .getByRole("searchbox", { name: "Search pages and projects" })
    .fill("Prism");
  await expect(finder.getByRole("button", { name: /Prism/ })).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/prism$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Prism.");
});

test("project quick preview shows context and restores focus on close", async ({
  page,
}) => {
  await page.goto("/?intro=0#work");
  const trigger = page.getByRole("button", { name: "Quick preview of Orbit" });
  await trigger.click();
  const preview = page.getByRole("dialog", { name: "Orbit project preview" });
  await expect(preview).toBeVisible();
  await expect(preview).toContainText("THE CHALLENGE");
  await expect(preview).toContainText("THE APPROACH");
  await expect(
    preview.getByRole("link", { name: "Explore the live demo" }),
  ).toHaveAttribute("href", "/projects/orbit");
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("decorative canvases stay still when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?intro=0");
  await page.locator(".signal-canvas").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const capture = () =>
    page
      .locator("canvas")
      .evaluateAll((canvases) => canvases.map((canvas) => canvas.toDataURL()));
  const first = await capture();
  await page.waitForTimeout(220);
  expect(await capture()).toEqual(first);
  await expect(page.locator(".skills-track")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".pixel-roamer")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".pixel-dog-frame.frame-0").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("Orbit creates, persists, edits, filters, moves and deletes tasks", async ({
  page,
}) => {
  await page.goto("/projects/orbit");
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByLabel("Task name").fill("Ship the portfolio");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Review keyboard and mobile flows.");
  await page.getByLabel("Priority", { exact: true }).selectOption("High");
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(
    page.getByRole("heading", { name: "Ship the portfolio" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Ship the portfolio" }),
  ).toBeVisible();
  await page.getByLabel("Status for Ship the portfolio").selectOption("Done");
  await expect(
    page
      .getByRole("region", { name: "Done", exact: true })
      .getByRole("heading", { name: "Ship the portfolio" }),
  ).toBeVisible();
  await page.getByLabel("Filter by priority").selectOption("Low");
  await expect(
    page.getByRole("heading", { name: "Ship the portfolio" }),
  ).toHaveCount(0);
  await page.getByLabel("Filter by priority").selectOption("All priorities");
  await page.getByRole("button", { name: "Edit Ship the portfolio" }).click();
  await page.getByLabel("Task name").fill("Portfolio is ready");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByLabel("Search tasks").fill("Portfolio is ready");
  await expect(page.locator(".task-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Edit Portfolio is ready" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.locator(".task-card")).toHaveCount(0);
});

test("Orbit supports drag and drop", async ({ page }) => {
  await page.goto("/projects/orbit");
  const card = page
    .locator(".task-card")
    .filter({ hasText: "Explore visual directions" });
  await card.dragTo(page.getByRole("region", { name: "Done", exact: true }));
  await expect(
    page.getByLabel("Status for Explore visual directions"),
  ).toHaveValue("Done");
});

test("Store filters, shows details, persists quantities and completes a demo order", async ({
  page,
}) => {
  await page.goto("/projects/form");
  await page.getByRole("button", { name: "Lighting", exact: true }).click();
  await expect(page.locator(".store-grid article")).toHaveCount(1);
  await page.getByRole("button", { name: "View The Arc Lamp details" }).click();
  await page.getByRole("button", { name: "Add to bag — $89" }).click();
  await expect(page.getByRole("dialog")).toContainText("Total$97");
  await page
    .getByRole("button", { name: "Increase The Arc Lamp quantity" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Total$178");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Bag (2)" }).click();
  await expect(
    page.getByLabel("The Arc Lamp quantity", { exact: true }),
  ).toHaveText("2");
  await page.getByRole("button", { name: "Complete demo order" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "No payment was collected",
  );
  await page.getByRole("button", { name: "Keep exploring" }).click();
  await expect(page.getByRole("button", { name: "Bag (0)" })).toBeVisible();
});

test("Margin creates and persists Markdown, safely previews and downloads it", async ({
  page,
}) => {
  await page.goto("/projects/margin");
  await page.getByRole("button", { name: "Create a new note" }).click();
  await page.getByLabel("Note title").fill("A useful test");
  await page
    .getByLabel("Note content")
    .fill(
      "# A good idea\n\n**Strong words**\n\n- Build it\n- Ship it\n\n<script>window.hacked=true</script>",
    );
  await page.getByRole("button", { name: "Preview note" }).click();
  await expect(page.locator(".markdown-content h2")).toHaveText("A good idea");
  await expect(page.locator(".markdown-content strong")).toHaveText(
    "Strong words",
  );
  await expect(page.locator(".markdown-content li")).toHaveCount(2);
  expect(await page.evaluate(() => "hacked" in window)).toBeFalsy();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download note as Markdown" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("A useful test.md");
  await page.reload();
  await expect(page.getByLabel("Note title")).toHaveValue("A useful test");
  await page.getByLabel("Search notes").fill("A useful test");
  await expect(page.locator(".note-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Delete note", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete note", exact: true })
    .click();
  await expect(page.locator(".note-item")).toHaveCount(0);
});

test("Prism preserves locked colors, validates edits and exports CSS", async ({
  page,
}) => {
  await page.goto("/projects/prism");
  const first = await page.getByLabel("Hex color 1").inputValue();
  const second = await page.getByLabel("Hex color 2").inputValue();
  await page.getByRole("button", { name: "Lock color 1", exact: true }).click();
  await page.getByRole("button", { name: "Generate palette" }).click();
  await expect(page.getByLabel("Hex color 1")).toHaveValue(first);
  await expect(page.getByLabel("Hex color 2")).not.toHaveValue(second);
  await page.getByLabel("Hex color 2").fill("zzzzzz");
  await page.getByLabel("Hex color 2").press("Tab");
  await expect(page.getByLabel("Hex color 2")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Hex color 2").fill("#FF0000");
  await page.getByLabel("Hex color 2").press("Tab");
  await page.reload();
  await expect(page.getByLabel("Hex color 2")).toHaveValue("#FF0000");
  await expect(
    page.getByRole("button", { name: "Unlock color 1", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Export palette" }).click();
  await expect(page.locator(".css-export")).toContainText(
    "--color-2: #FF0000;",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSS" }).click();
  expect((await download).suggestedFilename()).toBe("prism-palette.css");
});

test("dialogs trap focus, close on Escape and restore focus", async ({
  page,
}) => {
  await page.goto("/projects/orbit");
  const trigger = page.getByRole("button", { name: "New task", exact: true });
  await trigger.click();
  await expect(page.getByLabel("Task name")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("corrupt storage falls back and unavailable storage stays usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("anant-orbit-v1", "{bad");
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new DOMException("Full", "QuotaExceededError");
      },
    });
  });
  await page.goto("/projects/orbit");
  await expect(page.locator(".task-card")).toHaveCount(6);
  await expect(
    page.getByText("Browser storage is unavailable.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByLabel("Task name").fill("Still works");
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(
    page.getByRole("heading", { name: "Still works" }),
  ).toBeVisible();
});

for (const route of [
  "/",
  "/projects/orbit",
  "/projects/form",
  "/projects/margin",
  "/projects/prism",
]) {
  test(`${route} has no horizontal overflow on mobile and no runtime errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route === "/" ? "/?intro=0" : route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    if (route === "/") {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation")
        .getByRole("link", { name: "About" })
        .click();
      await expect(page).toHaveURL(/#about/);
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toHaveAttribute("aria-expanded", "false");
    }
    expect(errors).toEqual([]);
  });
  test(`${route} passes WCAG 2.1 AA automated checks`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route === "/" ? "/?intro=0" : route);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForTimeout(1100);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

test("unknown routes show a useful recovery page", async ({ page }) => {
  await page.goto("/missing");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Nothing here",
  );
  await page.getByRole("link", { name: "Back to the portfolio" }).click();
  await expect(page).toHaveURL("/");
});

test("fresh section links land on the requested content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?intro=0#work");
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(500);
  await expect(
    page.getByRole("heading", { name: "Ideas, made tangible." }),
  ).toBeInViewport();
  await page.goto("/projects/orbit");
  await page.getByRole("link", { name: "Back to selected work" }).click();
  await page
    .getByRole("dialog", { name: "Welcome to Anant’s portfolio" })
    .getByRole("button", { name: /I’ll explore on my own/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ideas, made tangible." }),
  ).toBeInViewport();
});
