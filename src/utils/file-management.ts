import { CliUx } from '@oclif/core';
import { yellow } from 'colors';
import * as fs from 'fs';
import * as path from 'path';

import { render } from './template';

export function createRootFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    CliUx.ux.log(yellow(`${folderPath} is not found. Creating.`))
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

export interface IFilePreprocess {
  fileName: string;
  content: string;
}

export interface IFolderContentOptions {
  data: { [name: string]: any },
  filePreprocess?: (data: IFilePreprocess) => IFilePreprocess
}

export function createFolderContent(templatePath: string, targetPath: string, options: IFolderContentOptions) {
  // read all files/folders (1 level) from template folder
  const filesToCreate = fs.readdirSync(templatePath);
  // loop each file/folder
  filesToCreate.forEach(file => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      // read file content and transform it using template engine
      let content = fs.readFileSync(origFilePath, 'utf8');
      let fileName = file;
      if (options.filePreprocess) {
        const result = options.filePreprocess({ fileName, content });
        fileName = result.fileName;
        content = result.content;
      }
      content = render(content, options.data);
      // write file to destination folder
      const writePath = path.join(targetPath, fileName);
      fs.writeFileSync(writePath, content, 'utf8');
    } else if (stats.isDirectory()) {
      // create folder in destination folder
      fs.mkdirSync(path.join(targetPath, file));
      // copy files/folder inside current folder recursively
      createFolderContent(path.join(templatePath, file), targetPath, options);
    }
  });
}
