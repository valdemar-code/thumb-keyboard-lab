const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { chromium, webkit } = require("playwright");

test("flick, chord, editing, settings, mobile layout and offline PWA", async () => {
  const server = spawn(
    "python3",
    ["-m", "http.server", "8123", "--bind", "127.0.0.1"],
    { stdio: "ignore" },
  );
  let browser;
  try {
    for (let i = 0; i < 50; i++) {
      try {
        if ((await fetch("http://127.0.0.1:8123")).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    browser =
      process.env.TEST_BROWSER === "webkit"
        ? await webkit.launch()
        : await chromium.launch({
            executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
            args: ["--no-sandbox"],
          });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:8123");
    const text = () => page.locator("#typed").textContent();
    const clear = () => page.locator("#clear").click();
    const pointer = async (
      side,
      index,
      dx = 0,
      dy = 0,
      id = 1,
      cancel = false,
    ) => {
      const key = page
        .locator(`#${side === "L" ? "left" : "right"}Keys .key`)
        .nth(index);
      await key.dispatchEvent("pointerdown", {
        pointerId: id,
        pointerType: "touch",
        clientX: 100,
        clientY: 100,
        bubbles: true,
      });
      if (dx || dy)
        await page.dispatchEvent("body", "pointermove", {
          pointerId: id,
          clientX: 100 + dx,
          clientY: 100 + dy,
          bubbles: true,
        });
      await page.dispatchEvent("body", cancel ? "pointercancel" : "pointerup", {
        pointerId: id,
        clientX: 100 + dx,
        clientY: 100 + dy,
        bubbles: true,
      });
    };
    // Existing installations receive changed defaults without losing custom slots.
    await page.evaluate(() => {
      const legacy = Object.fromEntries(
        Object.entries(previousDefaults).map(([name, sides]) => [
          name,
          Object.fromEntries(
            Object.entries(sides).map(([side, rows]) => [
              side,
              rows.map((row) => Array.from(row)),
            ]),
          ),
        ]),
      );
      legacy.flick23.L[0][0] = "*";
      localStorage.setItem(
        "thumb-flick-v1",
        JSON.stringify({ mode: "flick23", maps: legacy }),
      );
    });
    await page.reload();
    assert.equal(await page.evaluate(() => maps.flick23.L[0][0]), "*");
    assert.equal(await page.evaluate(() => maps.flick23.L[1][1]), "€");
    assert.equal(await page.evaluate(() => maps.flick23.R[5][0]), " ");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator("#information summary").click();
    for (const mode of ["flick23", "flick22"]) {
      await page.locator("#mode").selectOption(mode);
      assert.equal(
        await page.locator(".key").count(),
        mode === "flick23" ? 12 : 8,
      );
      const rows = await page.evaluate(() =>
        JSON.parse(JSON.stringify(maps[mode])),
      );
      assert.equal(
        /[éèíïóßü]/u.test(Object.values(rows).flat(2).join("")),
        false,
      );
      await clear();
      await page.locator("#rightKeys .key").last().click();
      assert.equal(await text(), " ");
      for (const side of ["L", "R"])
        for (let k = 0; k < rows[side].length; k++)
          for (const [d, [dx, dy]] of [
            [0, [0, 0]],
            [1, [0, -40]],
            [2, [0, 40]],
            [3, [-40, 0]],
            [4, [40, 0]],
          ]) {
            await clear();
            await pointer(side, k, dx, dy);
            assert.equal(
              await text(),
              rows[side][k][d],
              `${mode} ${side}${k} direction ${d}`,
            );
          }
      await clear();
      await pointer("L", 0);
      await pointer("L", 0);
      assert.equal(await text(), "aa");
      await clear();
      await pointer("L", 0, 40, 0, 1, true);
      assert.equal(await page.locator("#chars").textContent(), "0");
      // Overlapping independent thumbs, released in reverse order; no chord or ghost tap.
      await page
        .locator("#leftKeys .key")
        .first()
        .dispatchEvent("pointerdown", {
          pointerId: 10,
          clientX: 100,
          clientY: 100,
        });
      await page
        .locator("#rightKeys .key")
        .first()
        .dispatchEvent("pointerdown", {
          pointerId: 11,
          clientX: 100,
          clientY: 100,
        });
      await page.dispatchEvent("body", "pointerup", {
        pointerId: 11,
        clientX: 100,
        clientY: 60,
      });
      await page.dispatchEvent("body", "pointerup", {
        pointerId: 10,
        clientX: 100,
        clientY: 100,
      });
      assert.equal(await text(), rows.R[0][1] + "a");
      assert.equal(await page.locator("#chords").textContent(), "0");
      // Settings changes cancel contacts without typing.
      await page
        .locator("#leftKeys .key")
        .first()
        .dispatchEvent("pointerdown", {
          pointerId: 12,
          clientX: 100,
          clientY: 100,
        });
      await page.locator("#mode").selectOption("chord");
      await page.dispatchEvent("body", "pointerup", {
        pointerId: 12,
        clientX: 100,
        clientY: 100,
      });
      assert.equal(await text(), rows.R[0][1] + "a");
    }
    await page.locator("#mode").selectOption("flick23");
    const custom = page.getByRole("textbox", {
      name: "L key 1 tap",
      exact: true,
    });
    await custom.fill("ö");
    await custom.dispatchEvent("change");
    await page.reload();
    await clear();
    await pointer("L", 0);
    assert.equal(await text(), "ö");
    await page.locator("#caps").click();
    await pointer("L", 0);
    assert.equal(await text(), "öÖ");
    await page.locator("#backspace").click();
    assert.equal(await text(), "ö");
    await page.locator("#caps").click();
    await page.locator("#information").evaluate((e) => (e.open = true));
    await page.locator("#resetMap").click();
    await clear();
    await pointer("L", 0);
    assert.equal(await text(), "a");
    // Invalid mapping must not replace a working character.
    await custom.fill("ab");
    await custom.dispatchEvent("change");
    assert.equal(await custom.evaluate((e) => e.validity.valid), false);
    await clear();
    await pointer("L", 0);
    assert.equal(await text(), "a");
    await page.locator("#mode").selectOption("chord");
    await clear();
    await page.locator("#information").evaluate((e) => (e.open = false));
    await page.locator("#clear").evaluate((e) => e.blur());
    await page.keyboard.down("1");
    await page.keyboard.down("q");
    await page.keyboard.up("1");
    await page.keyboard.up("q");
    assert.equal(await text(), "b");
    assert.equal(await page.locator("#chords").textContent(), "1");
    await pointer("R", 0, 40, 0);
    assert.equal(await text(), "b ");
    await pointer("L", 5);
    assert.equal(await text(), "b ä");
    // Native touch stream exercises capture and movement across key boundaries in Chromium.
    await page.locator("#information").evaluate((e) => (e.open = true));
    await page.locator("#mode").selectOption("flick23");
    await page.locator("#information").evaluate((e) => (e.open = false));
    if (process.env.TEST_BROWSER !== "webkit") {
      await clear();
      const cdp = await context.newCDPSession(page);
      const box = await page.locator("#leftKeys .key").first().boundingBox();
      const x = box.x + box.width / 2,
        y = box.y + box.height / 2;
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y, id: 1 }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - 45, id: 1 }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      assert.equal(await text(), "ä");
      await clear();
      const right = await page.locator("#rightKeys .key").first().boundingBox();
      const other = {
        x: right.x + right.width / 2,
        y: right.y + right.height / 2,
        id: 2,
      };
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y, id: 1 }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y, id: 1 }, other],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [other],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      assert.equal(await text(), "na");
      assert.equal(await page.locator("#chords").textContent(), "0");
    }
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 700 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      const box = await page.locator(".keyboard").boundingBox();
      assert.ok(box.y + box.height <= 700);
      assert.ok((await page.locator(".output").boundingBox()).height >= 76);
    }
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    assert.equal(
      await page.evaluate(() => !!navigator.serviceWorker.controller),
      true,
    );
    for (const asset of [
      "manifest.webmanifest",
      "sw.js",
      "icons/icon-192.png",
      "icons/icon-512.png",
      "icons/apple-touch-icon.png",
    ])
      assert.equal(
        (await page.request.get("http://127.0.0.1:8123/" + asset)).status(),
        200,
      );
    await context.setOffline(true);
    await page.reload();
    assert.equal(await page.locator(".key").count(), 12);
    await clear();
    await pointer("L", 0);
    assert.equal(await text(), "a");
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    server.kill();
  }
});
