#!/usr/bin/env node
/**
 * CLI helper for the filename obfuscator.
 * Used by backup-to-gdrive.sh to compute the upload name from the PKG title.
 *
 * Usage:
 *   tsx scripts/obfuscate-name.ts "<title>" [extension] [pkg-id]
 *
 * Examples:
 *   tsx scripts/obfuscate-name.ts "Crash Bandicoot Warped"
 *     → Bandicota_Accident_Wrapped.zip
 *   tsx scripts/obfuscate-name.ts "Crash Bandicoot Warped" zip abc-123
 *     → Bandicota_Accident_Wrapped_<saltHash>.zip
 *
 * Console-specific extensions (pkg/nsp/xci/iso/...) are rewritten to the
 * default (.zip) automatically — the upload should never advertise the
 * platform. Pass an explicit neutral extension as arg 2 to override.
 */
import { obfuscateFilename } from "../lib/filename-obfuscator";

const [, , raw, extOrFlag, pkgId] = process.argv;

if (!raw) {
  process.stderr.write(
    "usage: obfuscate-name <title-or-filename> [extension] [pkg-id]\n",
  );
  process.exit(1);
}

const out = obfuscateFilename(raw, {
  defaultExt: extOrFlag && !extOrFlag.startsWith("-") ? extOrFlag : "zip",
  salt: pkgId && !pkgId.startsWith("-") ? pkgId : undefined,
});

process.stdout.write(out + "\n");
