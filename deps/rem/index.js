/**
 * Created by hyl on 16/8/30.
 * @desc rem换算,自动webpack引入
 */

const docEl = document.documentElement;
const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
let rate;
const recalc = () => {
    const clientWidth = docEl.clientWidth;
    if (!clientWidth) return;
    rate = 100 * (clientWidth / 750);
    docEl.style.fontSize = `${rate}px`;
};
recalc();

window.addEventListener(resizeEvt, recalc, false);

const rem2px = (rem) => rate * rem;

export default rem2px;
