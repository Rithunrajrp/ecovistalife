"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// Load environment variables manually
var envPath = path_1.default.resolve(process.cwd(), ".env.local");
var envVars = fs_1.default.readFileSync(envPath, "utf-8").split("\n");
var env = {};
for (var _i = 0, envVars_1 = envVars; _i < envVars_1.length; _i++) {
    var line = envVars_1[_i];
    var _a = line.split("="), key = _a[0], values = _a.slice(1);
    if (key && values.length > 0) {
        env[key.trim()] = values.join("=").trim().replace(/"/g, "");
    }
}
var supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
var supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var pages, _i, pages_1, page, existing, pageId, data, allPages, getPageId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Seeding started...");
                    // PAGES
                    console.log("Seeding Pages...");
                    pages = [
                        { title: "Home", slug: "home" },
                        { title: "About Us", slug: "about" },
                        { title: "Our Projects", slug: "projects" },
                        { title: "Insights & Blog", slug: "blogs" },
                        { title: "Contact", slug: "contact" }
                    ];
                    _i = 0, pages_1 = pages;
                    _a.label = 1;
                case 1:
                    if (!(_i < pages_1.length)) return [3 /*break*/, 6];
                    page = pages_1[_i];
                    return [4 /*yield*/, supabase.from("pages").select("id").eq("slug", page.slug).single()];
                case 2:
                    existing = (_a.sent()).data;
                    pageId = void 0;
                    if (!!existing) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase.from("pages").insert([page]).select().single()];
                case 3:
                    data = (_a.sent()).data;
                    pageId = data === null || data === void 0 ? void 0 : data.id;
                    console.log("Created page: ".concat(page.slug));
                    return [3 /*break*/, 5];
                case 4:
                    pageId = existing.id;
                    console.log("Page exists: ".concat(page.slug));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [4 /*yield*/, supabase.from("pages").select("*")];
                case 7:
                    allPages = (_a.sent()).data;
                    getPageId = function (slug) { var _a; return (_a = allPages === null || allPages === void 0 ? void 0 : allPages.find(function (p) { return p.slug === slug; })) === null || _a === void 0 ? void 0 : _a.id; };
                    // HOME BLOCKS
                    return [4 /*yield*/, insertBlocks(getPageId("home"), [
                            { type: 'hero', sort_order: 0, content: { "title": "Where Nature Meets Luxury.", "subtitle": "Discover exquisitely designed, sustainable homes that offer an unparalleled standard of living. Invest in a future that values both elegance and the environment.", "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000", "buttonText": "Explore Projects", "buttonLink": "/projects" } },
                            { type: 'projects_grid', sort_order: 1, content: { "heading": "Featured Projects", "filterType": "all" } },
                            { type: 'text', sort_order: 2, content: { "heading": "Redefining Modern Living", "subheading": "About EcoVistaLife", "body": "We are committed to delivering exceptional real estate developments that perfectly balance luxurious amenities with sustainable practices. Every project is a testament to our dedication towards innovation and environmental consciousness." } },
                            { type: 'blogs_grid', sort_order: 3, content: { "heading": "Latest News" } },
                            { type: 'cta', sort_order: 4, content: { "heading": "Ready to step into luxury living?", "description": "Get in touch with our experts today and discover the perfect property that matches your lifestyle and aspirations.", "buttonText": "Contact Us Today", "buttonLink": "/contact" } }
                        ])];
                case 8:
                    // HOME BLOCKS
                    _a.sent();
                    // ABOUT BLOCKS
                    return [4 /*yield*/, insertBlocks(getPageId("about"), [
                            { type: 'hero', sort_order: 0, content: { "title": "About EcoVistaLife", "subtitle": "Pioneering sustainable luxury in real estate development since 2010.", "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000" } },
                            { type: 'image_text', sort_order: 1, content: { "heading": "Building the Future, Naturally.", "body": "Founded on the principles of sustainability and uncompromising quality, EcoVistaLife emerged with a vision to redefine the real estate landscape. We believe that a home is more than just a structure; it''s a sanctuary that should harmonize with its natural surroundings.\n\nOver the years, our dedicated team of architects, designers, and environmental experts have collaborated to craft living spaces that not only offer premium luxury but also significantly reduce environmental impact.", "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800", "imagePosition": "left" } },
                            { type: 'text', sort_order: 2, content: { "heading": "Our Vision", "body": "To be the global leader in sustainable luxury real estate, creating intelligent communities that inspire a modern, eco-conscious way of living while preserving the planet for future generations." } },
                            { type: 'text', sort_order: 3, content: { "heading": "Our Mission", "body": "To design and build premium properties that seamlessly integrate cutting-edge green technologies, timeless aesthetics, and superior comfort without compromising on environmental integrity." } }
                        ])];
                case 9:
                    // ABOUT BLOCKS
                    _a.sent();
                    // PROJECTS BLOCKS
                    return [4 /*yield*/, insertBlocks(getPageId("projects"), [
                            { type: 'hero', sort_order: 0, content: { "title": "Our Projects", "subtitle": "Explore our diverse portfolio of sustainable luxury properties.", "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000" } },
                            { type: 'projects_grid', sort_order: 1, content: { "heading": "All Projects", "filterType": "all" } }
                        ])];
                case 10:
                    // PROJECTS BLOCKS
                    _a.sent();
                    // BLOGS BLOCKS
                    return [4 /*yield*/, insertBlocks(getPageId("blogs"), [
                            { type: 'hero', sort_order: 0, content: { "title": "Insights & News", "subtitle": "Latest trends in real estate, sustainable living, and home design.", "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000" } },
                            { type: 'blogs_grid', sort_order: 1, content: { "heading": "Latest Articles" } }
                        ])];
                case 11:
                    // BLOGS BLOCKS
                    _a.sent();
                    // CONTACT BLOCKS
                    return [4 /*yield*/, insertBlocks(getPageId("contact"), [
                            { type: 'hero', sort_order: 0, content: { "title": "Contact Us", "subtitle": "We are here to help you find your perfect home.", "image": "" } },
                            { type: 'contact_info', sort_order: 1, content: { "heading": "Get in Touch", "body": "Reach out to us for any inquiries. We''ll get back to you as soon as possible." } },
                            { type: 'form', sort_order: 2, content: { "heading": "Send us a Message", "formId": "f1000000-0000-0000-0000-000000000001", "buttonText": "Submit" } }
                        ])];
                case 12:
                    // CONTACT BLOCKS
                    _a.sent();
                    console.log("Seeding complete!");
                    return [2 /*return*/];
            }
        });
    });
}
function insertBlocks(pageId, blocks) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, blocks_1, block;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pageId)
                        return [2 /*return*/];
                    // Delete old blocks
                    return [4 /*yield*/, supabase.from("blocks").delete().eq("page_id", pageId)];
                case 1:
                    // Delete old blocks
                    _a.sent();
                    _i = 0, blocks_1 = blocks;
                    _a.label = 2;
                case 2:
                    if (!(_i < blocks_1.length)) return [3 /*break*/, 5];
                    block = blocks_1[_i];
                    return [4 /*yield*/, supabase.from("blocks").insert([{
                                page_id: pageId,
                                type: block.type,
                                sort_order: block.sort_order,
                                content: block.content
                            }])];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Inserted ".concat(blocks.length, " blocks for page ").concat(pageId));
                    return [2 /*return*/];
            }
        });
    });
}
seed().catch(console.error);
