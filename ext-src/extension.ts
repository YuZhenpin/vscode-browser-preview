import * as vscode from 'vscode';

import TargetTreeProvider from './targetTreeProvider';
import DebugProvider from './debugProvider';
import { BrowserViewWindowManager } from './BrowserViewWindowManager';
import { setupLiveShare } from './live-share';

import { RestClient } from './cloudbuild/restClient';
import { GroupNodeProvider } from './cloudbuild/nodes/groupNode';
import { ProjectNodeProvider } from './cloudbuild/nodes/projectNode';
import { RecordNodeProvider } from './cloudbuild/nodes/recordNode';

export function activate(context: vscode.ExtensionContext) {
  const windowManager = new BrowserViewWindowManager(context.extensionPath);
  const debugProvider = new DebugProvider(windowManager);

  vscode.window.registerTreeDataProvider('targetTree', new TargetTreeProvider());
  vscode.debug.registerDebugConfigurationProvider('browser-preview', debugProvider.getProvider());

  const restClient = new RestClient();

  // Samples of `window.registerTreeDataProvider`
  const nodeGroupProvider = new GroupNodeProvider(vscode.workspace.rootPath, restClient);
  vscode.window.registerTreeDataProvider('nodeGroups', nodeGroupProvider);
  vscode.commands.registerCommand('nodeGroups.refreshEntry', () => nodeGroupProvider.refresh());

  const projectNodeProvider = new ProjectNodeProvider(vscode.workspace.rootPath, restClient);
  vscode.window.registerTreeDataProvider('nodeProjects', projectNodeProvider);
  vscode.commands.registerCommand('nodeProjects.refreshEntry', () => projectNodeProvider.refresh());
  vscode.commands.registerCommand('nodeProjects.buildEntry', (projectNode) =>
    projectNodeProvider.buildProject(projectNode)
  );

  const recordNodeProvider = new RecordNodeProvider(vscode.workspace.rootPath, restClient, windowManager);
  vscode.window.registerTreeDataProvider('nodeRecords', recordNodeProvider);
  vscode.commands.registerCommand('nodeRecords.refreshEntry', () => recordNodeProvider.refresh());
  vscode.commands.registerCommand('nodeRecords.stopEntry', (recordNode) => recordNodeProvider.stopRecord(recordNode));
  vscode.commands.registerCommand('nodeRecords.showEntry', (recordModel) => recordNodeProvider.showRecord(recordModel));

  context.subscriptions.push(
    vscode.commands.registerCommand('browser-preview.openPreview', (url?) => {
      windowManager.create(url);
    }),

    vscode.commands.registerCommand('browser-preview.openActiveFile', () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return; // no active editor: ignore the command
      }

      // get active url
      const filename = activeEditor.document.fileName;

      if (filename) {
        windowManager.create(`file://${filename}`);
      }
    })
  );

  setupLiveShare(context.extensionPath, windowManager);
}
