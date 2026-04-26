import { useTranslation } from "hola-lang";
import { Controller } from "react-hook-form";
import { View, Text, TextInput } from "react-native";
import { defaultValues } from "../states/forms";
import { Computed } from "@legendapp/state/react";
import { styles } from "hola-ui";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export function AuthInput({ control, name, secureTextEntry, action, ...props }: any) {
    const { t } = useTranslation();
    const label = t(`home.auth.sign.${name}`);
    const [hiddenInput, setHiddenInput] = useState(true);

    return (
        <Computed>
            {() => <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => {
                    const onChangeText = e => { defaultValues?.[name].set(e); onChange(e); }
                    const style = [styles.input, { backgroundColor: "#F5F2F0" }];

                    return <View style={{ gap: 8 }}>
                        <Text style={{ fontWeight: "500" }}>{label}</Text>
                        <View
                            style={style}
                        >
                            <TextInput
                                onBlur={onBlur}
                                onChangeText={onChangeText}
                                value={value}
                                placeholder={label}
                                style={{ flex: 1, outlineStyle: "none" }}
                                secureTextEntry={secureTextEntry && hiddenInput}
                                //onSubmitEditing={action ? action : undefined}
                                {...props}
                            />
                            {secureTextEntry && <Ionicons name={!hiddenInput ? "eye-off" : "eye"} size={18} onPress={() => setHiddenInput(h => !h)} />}
                        </View>
                    </View>
                }}
                name={name}
                rules={{ required: true }}
            />}
        </Computed>
    );
}