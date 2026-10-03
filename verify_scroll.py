from playwright.sync_api import sync_playwright
import time

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        try:
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(2)  # Let initial 3D load and GSAP init

            # Capture hero
            page.screenshot(path="/home/jules/verification/scroll_1_hero.png")

            # Scroll to first text section to trigger Parallax 3D
            page.mouse.wheel(0, 800)
            time.sleep(1)
            page.screenshot(path="/home/jules/verification/scroll_2_mid.png")

            # Scroll deep into dashboard to trigger GSAP dashboard animations
            page.mouse.wheel(0, 2000)
            time.sleep(2)
            page.screenshot(path="/home/jules/verification/scroll_3_dashboard.png")

            print("Successfully captured screenshots.")
        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

verify()
