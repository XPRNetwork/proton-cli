/**
 * Compatibility shim for the parts of @oclif/core's ux API that we use
 * in command files. @oclif/core v4 trimmed the `ux` namespace down to
 * action/colorize/error/exit/stderr/stdout/warn — the helpers we relied on
 * (log, styledJSON, prompt, confirm, url) were removed.
 *
 * Rather than rewriting every call site, command files import { ux } from
 * here, which preserves the legacy API but is implemented with console.log,
 * JSON.stringify, and inquirer under the hood. Underlying dependencies
 * (inquirer for prompts) are already part of the project.
 */

import * as inquirer from 'inquirer'
import { ux as oclifUx } from '@oclif/core'

interface PromptOptions {
  default?: string
  type?: 'normal' | 'mask' | 'hide' | 'single'
  required?: boolean
}

export const ux = {
  /** Plain log to stdout. */
  log: (message?: string, ...args: any[]): void => {
    if (args.length > 0) console.log(message, ...args)
    else if (message === undefined) console.log()
    else console.log(message)
  },

  /** Pretty-prints a value as styled JSON to stdout. */
  styledJSON: (value: unknown): void => {
    console.log(JSON.stringify(value, null, 2))
  },

  /** Prompts the user for input. Mirrors the legacy ux.prompt signature. */
  prompt: async (message: string, options: PromptOptions = {}): Promise<string> => {
    const { type = 'normal', default: defaultValue, required = true } = options
    const inquirerType = type === 'mask' || type === 'hide' ? 'password' : 'input'
    const answers = await (inquirer as any).prompt([
      {
        name: 'value',
        type: inquirerType,
        message,
        default: defaultValue,
        validate: (input: string) => {
          if (required && (!input || input.length === 0) && !defaultValue) {
            return 'Value cannot be empty'
          }
          return true
        },
      },
    ])
    return answers.value
  },

  /** Confirmation prompt. Returns true for yes-like responses. */
  confirm: async (message: string): Promise<boolean> => {
    const answers = await (inquirer as any).prompt([
      { name: 'value', type: 'confirm', message, default: false },
    ])
    return Boolean(answers.value)
  },

  /** Print a hyperlink-ish line. */
  url: (text: string, url: string): void => {
    console.log(`${text}: ${url}`)
  },

  /**
   * Print rows as an aligned text table. Mirrors a useful subset of the legacy
   * CliUx.ux.table API used in this codebase: accepts an array of row objects
   * and a column-spec object that maps column keys to { header } configs.
   */
  table: (rows: any[], columns: Record<string, { header?: string }>, _options: any = {}): void => {
    const keys = Object.keys(columns)
    const headers = keys.map((k) => columns[k].header ?? k)
    const widths = headers.map((h, i) => {
      const colKey = keys[i]
      const cellWidths = rows.map((r) => String(r[colKey] ?? '').length)
      return Math.max(h.length, ...cellWidths)
    })
    const fmtLine = (cells: string[]) =>
      cells.map((c, i) => c.padEnd(widths[i])).join('  ')
    console.log(fmtLine(headers))
    console.log(fmtLine(widths.map((w) => '-'.repeat(w))))
    for (const row of rows) {
      console.log(fmtLine(keys.map((k) => String(row[k] ?? ''))))
    }
  },

  // Pass-throughs to the v4 namespace.
  action: oclifUx.action,
  colorize: oclifUx.colorize,
  error: oclifUx.error,
  exit: oclifUx.exit,
  stderr: oclifUx.stderr,
  stdout: oclifUx.stdout,
  warn: oclifUx.warn,
}
