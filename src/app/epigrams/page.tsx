import { redirect } from "next/navigation";

// 목록은 /epigramlist 에 있다. 예전 주소로 들어오면 그쪽으로 보낸다.
export default function EpigramsIndex() {
  redirect("/epigramlist");
}
