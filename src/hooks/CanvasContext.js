export default class CanvasContext {
	constructor(context) {
		this.ctx = context;
	}

	degreesToRadians(degrees) {
		var pi = Math.PI;
		return degrees * (pi / 180);
	}

	line(x1, y1, x2, y2, dash = null) {
		this.ctx.beginPath();
		this.ctx.setLineDash(dash ? dash : []);
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.stroke();
	}

	rotatedImage(image, x, y, width, height, angle) {
		let radians = this.degreesToRadians(angle);
		this.ctx.translate(x, y);
		this.ctx.rotate(radians);
		this.ctx.drawImage(image, -width / 2, -height, width, height);
		// this.ctx.drawImage(image, -width, -height, width, height);
		this.ctx.rotate(-radians);
		this.ctx.translate(-x, -y);
	}
}
