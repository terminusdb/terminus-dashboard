function HTMLDateHelper(){
	this.months = ["January", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
}

HTMLDateHelper.prototype.getMonthName = function(num){
	return this.months[num-1];
}

module.exports={HTMLDateHelper}