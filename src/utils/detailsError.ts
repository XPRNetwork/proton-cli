import { CliUx } from "@oclif/core"
import { red } from "colors"

export const parseDetailsError = (e: Error | any) => {
    const error = e && e.details && e.details.length && e.details[0] && e.details[0].message
    if (error || typeof e === 'object') {
      CliUx.ux.log('\n' + red(error || e.message))
    } else {
      CliUx.ux.styledJSON(e)
    }
}