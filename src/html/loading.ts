import { appendStyle, createHTMLElement } from "zyc-real-dom";

const cssSelectorPrefix = "bims_3d_";

function createLoadingStyle() {
	const style = document.querySelector(`#${cssSelectorPrefix}loading`);
	if (style) return;
	const element = document.createElement("style");
	element.id = `${cssSelectorPrefix}loading`;
	element.innerHTML = `
            .bims_3d_loading {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                box-sizing: border-box;
            }

            .bims_3d_loading > div {
                position: relative;
                box-sizing: border-box;
            }

            .bims_3d_loading {
                display: block;
                font-size: 0;
                color: #000;
            }

            .bims_3d_loading.la-dark {
                color: #333;
            }

            .bims_3d_loading > div {
                display: inline-block;
                float: none;
                background-color: currentColor;
                border: 0 solid currentColor;
            }

            .bims_3d_loading {
                width: 54px;
                height: 18px;
            }

            .bims_3d_loading > div {
                width: 10px;
                height: 10px;
                margin: 4px;
                border-radius: 100%;
                animation: ball-beat 0.7s -0.15s infinite linear;
            }

            .bims_3d_loading > div:nth-child(2n-1) {
                animation-delay: -0.5s;
            }

            @keyframes ball-beat {
            50% {
                opacity: 0.2;
                transform: scale(0.75);
            }

            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
	document.head.appendChild(element);
}

let loadingElement: HTMLElement | null = null;

function createLoadingElement() {
	const exists = document.querySelector(`.${cssSelectorPrefix}loading`);
	if (exists) return;
	const div = document.createElement("div");
	const c1 = document.createElement("div");
	const c2 = document.createElement("div");
	const c3 = document.createElement("div");
	div.className = cssSelectorPrefix + "loading";
	div.appendChild(c1);
	div.appendChild(c2);
	div.appendChild(c3);
	const wrapper = document.createElement("div");
	wrapper.style.position = "fixed";
	wrapper.style.left = "50%";
	wrapper.style.top = "50%";
	wrapper.style.transform = "translate(-50%, -50%)";
	wrapper.style.width = "100px";
	wrapper.style.height = "100px";
	wrapper.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	wrapper.style.borderRadius = "50%";
	wrapper.style.transition = ".3s";
	wrapper.style.opacity = "0";
	wrapper.style.zIndex = "-1";
	wrapper.appendChild(div);
	loadingElement = wrapper;
	document.body.appendChild(wrapper);
}

if (document.body) {
	createLoadingStyle();
	createLoadingElement();
} else {
	document.addEventListener("load", () => {
		createLoadingStyle();
		createLoadingElement();
	});
}

export function loading(status = true) {
	if (!loadingElement) return;
	loadingElement.style.opacity = status ? "1" : "0";
	loadingElement.style.zIndex = status ? "10" : "-1";
}
