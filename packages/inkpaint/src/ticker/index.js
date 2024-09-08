import Ticker from "./Ticker";

const shared = new Ticker();

shared.autoStart = true;
shared.destroy = () => {};

export { shared, Ticker };
