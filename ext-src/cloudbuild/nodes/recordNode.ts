import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { RestClient } from '../restClient';
import { ProjectModel } from '../models/projectModel';
import { RecordModel } from '../models/recordModel';
import { BrowserViewWindow } from '../../BrowserViewWindow';
import { BrowserViewWindowManager } from '../../BrowserViewWindowManager';

export class RecordNodeProvider implements vscode.TreeDataProvider<RecordNode> {
  private _projectModel: ProjectModel | undefined;
  private _browserViewWindow: BrowserViewWindow | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<RecordNode | undefined> = new vscode.EventEmitter<
    RecordNode | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<RecordNode | undefined> = this._onDidChangeTreeData.event;

  constructor(
    private workspaceRoot: string | undefined,
    private readonly restClient: RestClient,
    private readonly windowManager: BrowserViewWindowManager
  ) {
    vscode.commands.registerCommand('nodeRecords.showRecords', (projectModel) => this.showRecords(projectModel));
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RecordNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: RecordNode): Promise<RecordNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No record in empty workspace');
      //return Promise.resolve([]);
    }

    const records = await this.restClient.getRecords(this._projectModel);
    return records.map((r) => {
      const treeItem = new RecordNode(r, vscode.TreeItemCollapsibleState.None);
      treeItem.command = { command: 'nodeRecords.showEntry', title: 'Show Detail', arguments: [r] };
      return treeItem;
    });
  }

  showRecords(projectModel: ProjectModel) {
    this._projectModel = projectModel;
    vscode.window.showInformationMessage('Show builds of a project');
    this.refresh();
  }

  stopRecord(recordNode: RecordNode) {
    vscode.window.showInformationMessage('Stop a build ' + recordNode.label);
  }

  async showRecord(recordModel: RecordModel): Promise<void> {
    vscode.window.showInformationMessage('Show record detail');
    //RecordPanel.createOrShow(recordModel.name);
    //var launch = vscode.commands.executeCommand(`browser-preview.openPreview`, 'https://www.baidu.com/');
    if (this._browserViewWindow) {
      this._browserViewWindow.launch('htts://www.baidu.com/1');
    } else {
      this._browserViewWindow = await this.windowManager.create('htts://www.baidu.com/');
    }
  }
}

export class RecordNode extends vscode.TreeItem {
  constructor(public recordModel: RecordModel, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    super(recordModel.name, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.recordModel.name}`;
  }

  get description(): string {
    return this.recordModel.name;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };

  contextValue = 'record';
}
