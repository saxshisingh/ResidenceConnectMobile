import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },


  
    image: {
        width: "100%",
        height: 340,         
        resizeMode: "contain",
        marginTop: 36,
    },

    title: {
        marginTop: 24,
        marginLeft: 12,
        marginRight: 12,
        fontFamily: "Inter",
        fontWeight: "900",       
        fontSize: 36,
        lineHeight: 46.8,        
        letterSpacing: 1.8,      
        color: "#000000",
    },

    desc: {
        marginTop: 18,
        marginLeft: 12,
        marginRight: 24,
        fontFamily: "Inter",
        fontWeight: "500",
        fontSize: 18,
        lineHeight: 23.4,
        letterSpacing: 0.7,
        color: "#1F2937",
    },

    arrowBtn: {
        alignSelf: "flex-end",   
        marginTop: 32,
        marginRight: 12,
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },


    arrowText: {
        fontSize: 24,
        fontWeight: "600",
        color: "#111827",
    },

});

export default styles;
