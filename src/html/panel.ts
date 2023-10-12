import { appendStyle, createHTMLElement } from "zyc-real-dom";

appendStyle(".panel", {
	boxSizing: "border-box",
	position: "fixed",
	borderRadius: "8px",
	transition: ".3s",
	boxShadow: "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
	padding: "8px 0",
	letterSpacing: "2px",
	backgroundImage: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
	color: "#fff",
});

appendStyle(".panel-button", {
	border: "none",
	borderRadius: "5px",
	fontWeight: "bold",
	height: "32px",
	margin: "16px 16px 8px",
	cursor: "pointer",
	outline: "none",
	letterSpacing: "3px",
	color: "#ffffff",
	background: "rgba(255,255,255, 0.28)",
	boxShadow: "rgba(50, 50, 105, 0.15) 0px 2px 5px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px",
	transition: ".3s",
});

appendStyle(".panel-button:hover", { boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" });

// 隐藏元素
appendStyle(".hidden", { opacity: "0", zIndex: "-1" });

// 显示元素
appendStyle(".show", { opacity: "1", zIndex: "10" });

// 文本省略
appendStyle(".text_ellipsis", { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" });

export type MouseEventHandler = (e: MouseEvent) => void;

function basicBorder() {
	return "1px solid #dddddd";
}

interface PanelOption {
	title?: string | HTMLElement;
	width?: number;
	height?: number;
	left?: number;
	right?: number;
	top?: number;
	bottom?: number;
}

export class Panel {
	constructor(option: PanelOption) {
		this.init(option);
	}
	private dom: HTMLElement;
	private title: HTMLElement | null = null;
	private anchor: HTMLElement | null = null; // 插入 title 时使用的锚点
	private content: HTMLElement;
	private padding = 16;
	private titleHeight = 32;
	private _visible = false;
	protected animateDuration = 300;

	private init(option: PanelOption) {
		const width = option.width === undefined ? "auto" : option.width + "px";
		const div = createHTMLElement("div", { class: "panel hidden" }, { width, height: "auto" });
		if (option.left === undefined && option.right === undefined) div.style.right = "58px";
		if (option.top === undefined && option.bottom === undefined) div.style.top = "58px";
		if (option.left !== undefined) div.style.left = option.left + "px";
		if (option.right !== undefined) div.style.right = option.right + "px";
		if (option.top !== undefined) div.style.top = option.top + "px";
		if (option.bottom !== undefined) div.style.bottom = option.bottom + "px";
		this.dom = div;
		this.anchor = createHTMLElement("div", {}, {});
		this.dom.appendChild(this.anchor);
		if (option.title) this.renderTitle(option.title);
		this.createContent(option);
		document.body.appendChild(div);
	}

	// 创建 title
	protected renderTitle(title: string | HTMLElement) {
		this.removeTitle();
		let dom: HTMLElement;
		const p1 = this.padding + "px";
		const p2 = this.padding * 0.25 + "px";
		const padding = `0 ${p1} ${p2}`;
		const h = this.titleHeight + "px";
		if (typeof title == "string") {
			dom = createHTMLElement(
				"div",
				{ class: "panel-title" },
				{ fontSize: "16px", fontWeight: "bold", padding, height: h, lineHeight: h, borderBottom: basicBorder() }
			);
			dom.innerText = title;
		} else {
			title.style.padding = padding;
			title.classList.add("panel-title");
			dom = title;
		}
		this.title = dom;
		this.dom.insertBefore(dom, this.anchor);
	}

	// 创建内容区域 DOM
	private createContent(option: PanelOption) {
		const height = option.height === undefined ? "auto" : option.height + "px";
		const div = createHTMLElement("div", { class: "panel_content" }, { width: "100%", height, paddingTop: `${this.padding / 2}px` });
		this.content = div;
		this.dom.appendChild(div);
	}

	get visible() {
		return this._visible;
	}

	show() {
		if (this._visible) return;
		this._visible = true;
		this.dom.className = "panel show";
	}

	hidden() {
		if (!this._visible) return;
		this._visible = false;
		this.dom.className = "panel hidden";
	}

	setPosition(position: { left?: number; top?: number; right?: number; bottom?: number }) {
		const { left, right, top, bottom } = position;
		this.dom.style.left = left !== undefined ? left + "px" : "auto";
		this.dom.style.top = top !== undefined ? top + "px" : "auto";
		this.dom.style.right = right !== undefined ? right + "px" : "auto";
		this.dom.style.bottom = bottom !== undefined ? bottom + "px" : "auto";
	}

	moveTo(
		x: number,
		y: number,
		options: { origin?: "left_top" | "left_bottom" | "right_top" | "right_bottom"; offsetX?: number; offsetY?: number } = {}
	) {
		this.dom.style.right = "auto";
		this.dom.style.bottom = "auto";
		const { width: w, height: h } = this.dom.getBoundingClientRect();
		if (options.origin == "left_bottom") y -= h;
		if (options.origin == "right_top") x -= w;
		if (options.origin == "right_bottom") {
			x -= w;
			y -= h;
		}
		if (options.offsetX) x += options.offsetX;
		if (options.offsetY) y += options.offsetY;
		this.dom.style.top = x + "px";
		this.dom.style.left = y + "px";
	}

	getDom() {
		return this.dom;
	}

	getContentDom() {
		return this.content;
	}

	getTitleDom() {
		return this.title;
	}

	// 添加子元素
	append(dom: HTMLElement) {
		this.content.appendChild(dom);
	}

	// 删除标题
	removeTitle() {
		if (!this.title) return;
		this.title.remove();
		this.title = null;
	}

	// 清空内容区域
	clear() {
		this.content.innerHTML = "";
	}

	// 删除子元素
	remove(selector: string, all = false) {
		const children = all ? this.dom.querySelectorAll(selector) : [this.dom.querySelector(selector)];
		for (let i = 0; i < children.length; i++) {
			const element = children[i];
			element?.remove();
		}
	}

	private createButton(label: string, onclick?: (e: MouseEvent) => void) {
		const button = createHTMLElement("button", { class: "panel-button" }, {});
		button.innerText = label;
		if (onclick) button.addEventListener("click", onclick);
		return button;
	}

	addButton(label: string, onclick?: (e: MouseEvent) => void, danger = false) {
		const button = this.createButton(label, onclick);
		button.style.width = `calc(100% - ${this.padding * 2}px)`;
		button.style.display = "block";
		if (danger) button.style.color = "red";
		this.append(button);
	}

	addButtonGroup(buttons: Array<{ label: string; onclick?: (e: MouseEvent) => void; danger?: boolean }>) {
		if (!buttons.length) return;
		const container = createHTMLElement(
			"div",
			{ class: "button-group" },
			{ width: `calc(100% - ${this.padding * 2}px)`, whiteSpace: "nowrap", margin: "16px 16px 8px" }
		);
		container;
		const w = 100 / buttons.length;
		const s = ((buttons.length - 1) * this.padding) / buttons.length;
		const width = `calc(${w}% - ${s}px)`;
		buttons.forEach((btn, i) => {
			const button = this.createButton(btn.label, btn.onclick);
			button.style.width = width;
			button.style.display = "inline-block";
			button.style.margin = "0";
			button.style.marginLeft = i === 0 ? "0" : this.padding + "px";
			if (btn.danger) button.style.color = "red";
			container.appendChild(button);
		});
		this.append(container);
	}

	showField(label: string, value: string | number) {
		const div = createHTMLElement("div", { class: "text_ellipsis" }, { height: "30px", lineHeight: "36px", padding: `0 ${this.padding}px` });
		div.innerText = `${label}: ${value}`;
		this.append(div);
	}

	destroy() {
		this.hidden();
		const timer = setTimeout(() => {
			this.dom.remove();
			clearTimeout(timer);
		}, this.animateDuration);
	}
}
