import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { RestClient } from '../restClient';
import { GroupModel } from '../models/groupModel';

export class GroupNodeProvider implements vscode.TreeDataProvider<GroupNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<GroupNode | undefined> = new vscode.EventEmitter<
    GroupNode | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<GroupNode | undefined> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string, private restClient: RestClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: GroupNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: GroupNode): Promise<GroupNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No group in empty workspace');
      //return Promise.resolve([]);
    }

    const groups = await this.restClient.getGroups();
    return groups.map((g) => {
      let treeItem = new GroupNode(g, vscode.TreeItemCollapsibleState.None);
      treeItem.command = { command: 'nodeProjects.showProjects', title: 'Show Projects', arguments: [g] };
      return treeItem;
    });
  }
}

export class GroupNode extends vscode.TreeItem {
  constructor(
    public readonly groupModel: GroupModel,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(groupModel.name, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.groupModel.name}`;
  }

  get description(): string {
    return this.groupModel.name;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };

  contextValue = 'group';
}
