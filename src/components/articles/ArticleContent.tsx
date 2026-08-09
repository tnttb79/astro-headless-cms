import { quickStartViewerPlugins, RicosViewer } from "@wix/ricos";
import "@wix/ricos/css/all-plugins-viewer.css";

const plugins = quickStartViewerPlugins();

interface Props { content?: Record<string, unknown>; }

export default function ArticleContent({ content }: Props) {
  if (!content) return null;
  return <div className="ricos-content"><RicosViewer content={content as any} plugins={plugins} /></div>;
}
