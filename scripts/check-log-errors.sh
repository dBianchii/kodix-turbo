#!/bin/bash
tail -n 200 dev.log | grep -E "(error|Error|ERROR|failed|Failed|FAILED)" || true 