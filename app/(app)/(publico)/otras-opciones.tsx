import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const Page = () =>{
    return(
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:20,
    },
    closeBtn:{
    }
});

export default Page;