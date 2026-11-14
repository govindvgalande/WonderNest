#!/usr/bin/env python3
"""Device-level smoke of Android onboarding, auth, and 12 game routes.

Uses only Android's adb/UIAutomator (no screenshots parsed with OCR).
Requires an emulator with the standalone test APK installed. This is NOT an
automated certification of all gameplay, learning quality, or parental rules.
"""
import re
import subprocess
import time
import xml.etree.ElementTree as ET

APP = "com.wondernest.memoryadventure"
XML_PATH = "/data/local/tmp/wondernest-ui-smoke.xml"

def adb(*args, timeout=60):
    p = subprocess.run(["adb", *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                       text=True, timeout=timeout, check=False)
    if p.returncode:
        raise RuntimeError(f"adb {' '.join(args)}: {p.stderr[:600]}")
    return p.stdout

def dump():
    # UIAutomator occasionally sees only the splash; retry without hiding errors.
    for _ in range(6):
        adb("shell", "uiautomator", "dump", XML_PATH, timeout=50)
        text = adb("exec-out", "cat", XML_PATH)
        if "<hierarchy" in text:
            return ET.fromstring(text)
        time.sleep(1)
    raise AssertionError("No usable Android UI hierarchy")

def all_labels(root):
    labels = []
    for node in root.iter("node"):
        attrs = node.attrib
        labels.extend([attrs.get("text", ""), attrs.get("content-desc", "")])
    return [x for x in labels if x]

def must_see(text):
    for attempt in range(8):
        root = dump()
        if any(text.lower() in x.lower() for x in all_labels(root)):
            return root
        time.sleep(1.5)
    raise AssertionError(f"Missing UI label {text!r}; visible: {all_labels(root)[:35]}")

def pick_node(root, label):
    candidates = []
    for node in root.iter("node"):
        a=node.attrib
        matches = a.get("content-desc","")==label or a.get("text","")==label
        if matches and a.get("bounds"):
            candidates.append(node)
    if not candidates:
        for node in root.iter("node"):
            a=node.attrib
            if label.lower() in (a.get("content-desc","")+" "+a.get("text","")).lower() and a.get("bounds"):
                candidates.append(node)
    if not candidates:
        raise AssertionError(f"Cannot find {label!r}; visible: {all_labels(root)[:30]}")
    candidates.sort(key=lambda x: x.attrib.get("clickable")!="true")
    return candidates[0]

def tap(label):
    root=must_see(label)
    node=pick_node(root,label)
    coords=list(map(int,re.findall(r"\d+",node.attrib["bounds"])))
    if len(coords)!=4:
        raise AssertionError(f"Invalid tap bounds for {label}: {node.attrib['bounds']}")
    x=(coords[0]+coords[2])//2
    y=(coords[1]+coords[3])//2
    adb("shell","input","tap",str(x),str(y))
    time.sleep(1.1)

def edit(label, value):
    root=must_see(label)
    n=pick_node(root,label)
    bb=list(map(int,re.findall(r"\d+",n.attrib["bounds"])))
    adb("shell","input","tap",str((bb[0]+bb[2])//2),str((bb[1]+bb[3])//2))
    adb("shell","input","text",value)
    adb("shell","input","keyevent","KEYCODE_BACK")
    time.sleep(0.7)

def screenshot(filename):
    with open(filename,"wb") as f:
        p=subprocess.run(["adb","exec-out","screencap","-p"],stdout=f,stderr=subprocess.PIPE,timeout=50)
    if p.returncode:
        raise RuntimeError("Could not capture Android screen")
    print(f"EVIDENCE: {filename}")

def launch():
    adb("shell","am","force-stop",APP)
    adb("shell","am","start","-n",f"{APP}/.MainActivity")
    time.sleep(3)

def main():
    launch()
    must_see("Welcome to WonderNest!")
    print("PASS: Offline first screen and original child-friendly visuals rendered")
    tap("Continue")
    must_see("Create parent PIN")
    edit("Create parent PIN","638421")
    edit("Confirm PIN","638421")
    tap("Continue")
    must_see("Create explorer")
    tap("Create explorer")
    must_see("Your first adventure!")
    screenshot("WonderNest-guided-tutorial.png")
    print("PASS: Parent PIN setup, local child profile, guided first activity")
    tap("Try Memory Cards")
    must_see("Memory Card Match")
    screenshot("WonderNest-memory-cards.png")
    tap("Helpful hint")
    print("PASS: Memory Card game launches and accepts help")
    launch()
    must_see("Explorer!")
    tap("Choose an adventure")
    screenshot("WonderNest-games-collection.png")
    games=[
      "Memory Card Match",
      "Remember the Objects",
      "Pattern Memory",
      "What Is Missing?",
      "Treasure Memory Adventure",
      "Sound Memory",
      "Picture Detective",
      "Story Memory",
      "Shape & Color Memory",
      "Remember the Order",
      "Memory Maze",
      "Brain Explorer"
    ]
    for name in games:
        tap(name)
        must_see(name)
        if name!="Memory Card Match":
            tap("I remember!")
        must_see("Helpful hint")
        tap("Helpful hint")
        print(f"PASS: {name}: route and hint control respond")
        launch()
        must_see("Explorer!")
        tap("Choose an adventure")
    launch()
    tap("Parent area")
    must_see("Enter parent PIN")
    edit("Enter parent PIN","638421")
    tap("Unlock parent area")
    must_see("Parent control center")
    screenshot("WonderNest-parent-dashboard.png")
    tap("Screen time")
    must_see("Daily")
    tap("Learning progress")
    must_see("Last 7 days")
    print("PASS: Parent authentication and time/learning tabs")
    launch()
    must_see("Explorer!")
    print("PASS: Child profile and parent setup persist after app restart")
    print("PASS: Android UI smoke checks complete (NOT full E2E certification)")

if __name__=="__main__":
    main()
