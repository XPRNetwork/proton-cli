import { FormatCodeSettings } from 'ts-morph';
import { SemicolonPreference } from 'typescript';

export const FORMAT_SETTINGS: FormatCodeSettings = {
  insertSpaceAfterCommaDelimiter: true,
  insertSpaceAfterSemicolonInForStatements: true,
  insertSpaceBeforeAndAfterBinaryOperators: true,
  insertSpaceAfterKeywordsInControlFlowStatements: true,
  insertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: true,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
  insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: true,
  insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: true,
  insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: true,
  insertSpaceAfterTypeAssertion: true,
  indentMultiLineObjectLiteralBeginningOnBlankLine: true,
  semicolons: SemicolonPreference.Insert,
  ensureNewLineAtEndOfFile: true,
}
