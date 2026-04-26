
import { Selector } from '@hola/lang';
import { useNavigation } from '@react-navigation/native';

export function LangScreen() {
    const { navigate } = useNavigation();

    return <Selector callback={() => {
        navigate("CustomerAuth");
    }} />;
}