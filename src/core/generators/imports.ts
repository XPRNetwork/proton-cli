import { ImportDeclaration, SourceFile } from 'ts-morph';

export function addNamedImports(sourceFile: SourceFile, lib: string, importsToAdd: string[]): ImportDeclaration | undefined {
  importsToAdd = importsToAdd.filter((value, idx, self) => self.indexOf(value) === idx);
  let libImports = sourceFile.getImportDeclaration(lib);
  if (libImports) {
    const namedImports = libImports.getNamedImports().map((item) => item.getText());
    const importsNotExist = importsToAdd.reduce((accum: string[], importItem: string) => {
      if (namedImports.indexOf(importItem) < 0) {
        if (accum.indexOf(importItem) < 0) {
          accum.push(importItem);
        }
      }
      return accum;
    }, [])
    if (importsNotExist.length > 0) {
      libImports.addNamedImports(importsNotExist)
    }
  } else {
    libImports = sourceFile.addImportDeclaration({
      namedImports: importsToAdd,
      moduleSpecifier: lib,
    });
  }
  return libImports;
}
