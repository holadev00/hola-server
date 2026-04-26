import { observable, event } from "@legendapp/state";

export default {
        open: observable(false),

        event: event(),
        submit: event(),
        dismiss: event(),

        search: {
            address: observable<string | null>(null),
            result: observable<any[]>([])
        }
    }