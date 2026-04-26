
import { useNavigation } from '@react-navigation/native';
import { Selector } from '../components';

export function SelectorScreen() {
    const { navigate } = useNavigation();

    return <Selector callback={() => {
        console.log("callback");
        navigate("CustomerSettings");
    }} />;
}