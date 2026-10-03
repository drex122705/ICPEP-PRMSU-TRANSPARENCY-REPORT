import time
from playwright.sync_api import sync_playwright

def test_scroll_animations():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        try:
            # Go to the local dev server
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(2) # Give R3F time to load completely

            # Screenshot hero section
            page.screenshot(path="/home/jules/verification/scroll_1_hero_fixed.png")

            # Scroll halfway to test parallax
            page.evaluate("window.scrollTo(0, document.body.scrollHeight / 3)")
            time.sleep(1) # wait for lenis/gsap smooth scroll
            page.screenshot(path="/home/jules/verification/scroll_2_mid_fixed.png")

            # Scroll to dashboard
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1.5)
            page.screenshot(path="/home/jules/verification/scroll_3_dashboard_fixed.png")

        finally:
            browser.close()

if __name__ == "__main__":
    test_scroll_animations()
