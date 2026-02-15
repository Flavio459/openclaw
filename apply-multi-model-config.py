#!/usr/bin/env python3
"""
Apply the multi‑model configuration changes to openclaw.json.
This script applies the same changes as described in the JSON Patch file,
but without requiring the jsonpatch library.
"""
import json
import os
import sys

def main():
    config_path = os.path.expanduser('~/.openclaw/openclaw.json')
    if not os.path.exists(config_path):
        print(f"ERROR: Config file not found at {config_path}")
        sys.exit(1)
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # 1. Change primary model
    if 'agents' not in config:
        config['agents'] = {}
    if 'defaults' not in config['agents']:
        config['agents']['defaults'] = {}
    if 'model' not in config['agents']['defaults']:
        config['agents']['defaults']['model'] = {}
    
    config['agents']['defaults']['model']['primary'] = 'deepseek/deepseek-reasoner'
    
    # 2. Reorder fallbacks
    config['agents']['defaults']['model']['fallbacks'] = [
        'moonshot/kimi-k2.5',
        'google/gemini-3-flash-preview',
        'antigravity/claude-3-5-sonnet-20241022'
    ]
    
    # 3. Update aliases
    if 'models' not in config['agents']['defaults']:
        config['agents']['defaults']['models'] = {}
    
    aliases = config['agents']['defaults']['models']
    
    aliases['deepseek/deepseek-reasoner'] = {'alias': '🧠 DeepSeek Raciocinador'}
    aliases['moonshot/kimi-k2.5'] = {'alias': '📚 Kimi 256K'}
    aliases['google/gemini-3-flash-preview'] = {'alias': '⚡ Gemini Rápido'}
    aliases['antigravity/claude-3-5-sonnet-20241022'] = {'alias': '🎯 Claude Premium'}
    
    # Keep existing aliases (ensure they are not removed)
    # No need to delete; the above assignments will overwrite only those keys.
    
    # Write back
    backup_path = config_path + '.backup'
    try:
        os.rename(config_path, backup_path)
        print(f"Created backup at {backup_path}")
    except Exception as e:
        print(f"Warning: could not create backup: {e}")
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Configuration updated successfully.")
    print("Restart the OpenClaw gateway with: openclaw gateway restart")

if __name__ == '__main__':
    main()