import { Panel } from "./panel";

export interface LabelValuePair {
	label: string;
	value: string | number;
}

export interface ButtonOption {
	label: string;
	onclick?: (e: MouseEvent) => void;
	danger?: boolean;
}

export interface SingPanelOption {
	title?: string | HTMLElement;
	labelValuePairs?: LabelValuePair[];
	buttons?: ButtonOption[]; // 渲染按钮，一行一个
	buttonGroup?: ButtonOption[]; // 渲染按钮组，所有按钮在同一行
	buttonGroupList?: ButtonOption[][]; // 渲染多个按钮组
}

class SinglePanel extends Panel {
	constructor(width = 380) {
		super({ width });
	}

	private updateTitle(title?: string | HTMLElement) {
		this.removeTitle();
		if (title !== undefined) this.renderTitle(title);
	}

	private renderLabelValuePairs(labelValuePairs?: LabelValuePair[]) {
		if (!labelValuePairs) return;
		labelValuePairs.forEach((pair) => {
			this.showField(pair.label, pair.value);
		});
	}

	private renderButtons(buttons?: ButtonOption[]) {
		if (!buttons) return;
		buttons.forEach((btn) => {
			this.addButton(btn.label, btn.onclick, btn.danger);
		});
	}

	private renderButtonGroup(buttons?: ButtonOption[]) {
		if (!buttons) return;
		this.addButtonGroup(buttons);
	}

	private renderButtonGroupList(buttonGroupList?: ButtonOption[][]) {
		if (!buttonGroupList) return;
		buttonGroupList.forEach((group) => this.renderButtonGroup(group));
	}

	private _render(option: SingPanelOption) {
		this.updateTitle(option.title);
		this.clear();
		this.renderLabelValuePairs(option.labelValuePairs);
		this.renderButtons(option.buttons);
		this.renderButtonGroup(option.buttonGroup);
		this.renderButtonGroupList(option.buttonGroupList);
		this.show();
	}

	private renderTimer: any = null;

	render(option: SingPanelOption) {
		if (this.renderTimer) clearTimeout(this.renderTimer);
		if (this.visible) {
			this.hidden();
			this.renderTimer = setTimeout(() => this._render(option), this.animateDuration);
		} else {
			this._render(option);
		}
	}
}

// 全局唯一的操作面板，可通过 render 方法实时显示信息
export const globalPanel = new SinglePanel();
