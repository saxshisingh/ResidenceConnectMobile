import { StyleSheet } from "react-native";


const TOP_CIRCLE_SIZE = 360;
const TOP_RADIUS = TOP_CIRCLE_SIZE / 2;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
    overflow: "hidden", 
  },



  topCircle1: {
    position: "absolute",
    width: TOP_CIRCLE_SIZE,
    height: TOP_CIRCLE_SIZE,
    top: -220,
    left: -220,
    borderRadius: TOP_RADIUS,
    backgroundColor: "#F6C63680",
    zIndex: 1,
  },

  topCircle2: {
    position: "absolute",
    width: TOP_CIRCLE_SIZE,
    height: TOP_CIRCLE_SIZE,
    top: -260,
    left: -60,
    borderRadius: TOP_RADIUS,
    backgroundColor: "#F6C636",
    zIndex: 1,
  },

  topCircle3: {
    position: "absolute",
    width: TOP_CIRCLE_SIZE,
    height: TOP_CIRCLE_SIZE,
    top: -300,
    left: 140,
    borderRadius: TOP_RADIUS,
    backgroundColor: "#F6C63696",
    zIndex: 1,
  },


  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  image: {
    width: 400,
    height: 400,
    marginBottom: 32,
  },

  button: {
    backgroundColor: "#F6C636",
    paddingVertical: 14,
    paddingHorizontal: 72,
    borderRadius: 30,
    elevation: 4,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },

  

  bottomCircle2: {
 position: "absolute",
  width: 300,          
  height: 220,
  bottom: -120,       
  right: -230,        
  backgroundColor: "rgba(246, 198, 54, 0.59)",
  borderRadius: 150,
  zIndex: 0, 
  },

bottomCircle1: {
  position: "absolute",
  width: 320,          
  height: 300,         
  bottom: -260,       
  left: 100,
  backgroundColor: "#F6C636",
  borderRadius: 160,   
  zIndex: 1,
},

});

export default styles;
