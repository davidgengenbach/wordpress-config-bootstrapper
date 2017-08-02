#!/usr/bin/env python3

import os
import sys
import shutil
import glob
import json
import codecs

def main():
    args = get_args()
    if os.path.exists(args.dest_folder) and not args.force:
        print('Aborting: dest_folder exists: {}'.format(args.dest_folder))
        sys.exit(1)
    if os.path.exists(args.dest_folder):
        shutil.rmtree('bck', ignore_errors = True)
        shutil.move(args.dest_folder, 'bck')
    
    # Copy
    shutil.copytree(args.src_folder, args.dest_folder)

    # Config
    cfg = get_config(args.config_in)
    cfg_keys = get_all_config_keys(cfg)

    for filename in glob.iglob('{}/**/*'.format(args.dest_folder), recursive=True):
        if os.path.isdir(filename): continue
        try:
            with codecs.open(filename, 'r') as f:
                content = f.read()
        except:
            continue

        for key in cfg_keys:
            key_fmt = args.cfg_key_fmt.format(key)
            key_val = get_val_for_key(cfg, key)
            if isinstance(key_val, list):
                key_val = json.dumps(key_val)
            content = content.replace(key_fmt, str(key_val))

        with codecs.open(filename, 'w') as f:
            f.write(content)

def get_val_for_key(cfg, key):
    parts = key.split('.')
    for p in parts:
        cfg = cfg[p]
    return cfg

def get_all_config_keys(cfg, all_keys = [], current_key = []):
    if not cfg or not isinstance(cfg, dict): return all_keys
    assert isinstance(all_keys, list)
    assert isinstance(current_key, list)
    all_keys += [".".join(current_key + [key]) for key, val in cfg.items() if not isinstance(val, dict)]
    
    for key, val in cfg.items():
        if not isinstance(val, dict): continue
        all_keys += get_all_config_keys(val, [], current_key + [key])
    return all_keys

def get_config(file):
    with open(file) as f:
        return json.load(f)

def get_args():
    import argparse
    parser = argparse.ArgumentParser(description='Generate WordPress config')
    parser.add_argument('--config_in', type=str, help="help", default='config.default.json')
    parser.add_argument('--src_folder', type=str, help="help", default='src')
    parser.add_argument('--dest_folder', type=str, help="help", default='dest')
    parser.add_argument('--cfg_key_fmt', type=str, help="help", default='%{}%')
    parser.add_argument('--force', help="help", action='store_true')
    args = parser.parse_args()
    return args

if __name__ == '__main__':
    main()