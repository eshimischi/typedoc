import { Reflection, type TraverseCallback, TraverseProperty } from "./Reflection.js";
import { ReflectionCategory } from "./ReflectionCategory.js";
import { ReflectionGroup } from "./ReflectionGroup.js";
import { ReflectionKind } from "./kind.js";
import type { Deserializer, JSONOutput, Serializer } from "#serialization";
import type { DocumentReflection } from "./DocumentReflection.js";
import type { DeclarationReflection } from "./DeclarationReflection.js";
import { assertNever, removeIfPresent } from "#utils";

/**
 * @category Reflections
 */
export abstract class ContainerReflection extends Reflection {
    /**
     * The children of this reflection. Do not add reflections to this array
     * manually. Instead call {@link addChild}.
     */
    children?: Array<DeclarationReflection>;

    /**
     * Documents associated with this reflection.
     *
     * These are not children as including them as children requires code handle both
     * types, despite being mostly unrelated and handled separately.
     *
     * Including them here in a separate array neatly handles that problem, but also
     * introduces another one for rendering. When rendering, documents should really
     * actually be considered part of the "children" of a reflection. For this reason,
     * we also maintain a list of child declarations with child documents which is used
     * when rendering.
     */
    documents?: Array<DocumentReflection>;

    /**
     * Union of the {@link children} and {@link documents} arrays which dictates the
     * sort order for rendering.
     */
    childrenIncludingDocuments?: Array<
        DeclarationReflection | DocumentReflection
    >;

    /**
     * All children grouped by their kind.
     */
    groups?: ReflectionGroup[];

    /**
     * All children grouped by their category.
     */
    categories?: ReflectionCategory[];

    /**
     * Return a list of all children of a certain kind.
     *
     * @param kind  The desired kind of children.
     * @returns     An array containing all children with the desired kind.
     */
    getChildrenByKind(kind: ReflectionKind): DeclarationReflection[] {
        return (this.children || []).filter((child) => child.kindOf(kind));
    }

    addChild(child: Reflection) {
        if (child.isDeclaration()) {
            this.children ||= [];
            this.children.push(child);

            this.childrenIncludingDocuments ||= [];
            this.childrenIncludingDocuments.push(child);
        } else if (child.isDocument()) {
            this.documents ||= [];
            this.documents.push(child);

            this.childrenIncludingDocuments ||= [];
            this.childrenIncludingDocuments.push(child);
        } else if (this.isDeclaration() && child.isSignature()) {
            switch (child.kind) {
                case ReflectionKind.CallSignature:
                case ReflectionKind.ConstructorSignature:
                    this.signatures ||= [];
                    this.signatures.push(child);
                    break;
                case ReflectionKind.IndexSignature:
                    this.indexSignatures ||= [];
                    this.indexSignatures.push(child);
                    break;
                case ReflectionKind.GetSignature:
                case ReflectionKind.SetSignature:
                    throw new Error("Unsupported child type: " + ReflectionKind[child.kind]);
                default:
                    assertNever(child.kind);
            }
        } else {
            throw new Error("Unsupported child type: " + ReflectionKind[child.kind]);
        }
    }

    removeChild(child: DeclarationReflection | DocumentReflection) {
        if (child.isDeclaration()) {
            removeIfPresent(this.children, child);
            if (this.children?.length === 0) {
                delete this.children;
            }
        } else {
            removeIfPresent(this.documents, child);
            if (this.documents?.length === 0) {
                delete this.documents;
            }
        }

        removeIfPresent(this.childrenIncludingDocuments, child);
        if (this.childrenIncludingDocuments?.length === 0) {
            delete this.childrenIncludingDocuments;
        }
    }

    override isContainer(): this is ContainerReflection {
        return true;
    }

    override traverse(callback: TraverseCallback) {
        for (const child of this.children?.slice() || []) {
            if (callback(child, TraverseProperty.Children) === false) {
                return;
            }
        }

        for (const child of this.documents?.slice() || []) {
            if (callback(child, TraverseProperty.Documents) === false) {
                return;
            }
        }
    }

    override toObject(serializer: Serializer): JSONOutput.ContainerReflection {
        return {
            ...super.toObject(serializer),
            children: serializer.toObjectsOptional(this.children),
            documents: serializer.toObjectsOptional(this.documents),
            // If we only have one type of child, don't bother writing the duplicate info about
            // ordering with documents to the serialized file.
            childrenIncludingDocuments: this.children?.length && this.documents?.length
                ? this.childrenIncludingDocuments?.map((refl) => refl.id)
                : undefined,
            groups: serializer.toObjectsOptional(this.groups),
            categories: serializer.toObjectsOptional(this.categories),
        };
    }

    override fromObject(de: Deserializer, obj: JSONOutput.ContainerReflection) {
        super.fromObject(de, obj);
        this.children = de.reviveMany(obj.children, (child) => de.constructReflection(child));
        this.documents = de.reviveMany(obj.documents, (child) => de.constructReflection(child));

        const byId = new Map<
            number,
            DeclarationReflection | DocumentReflection
        >();
        for (const child of this.children || []) {
            byId.set(child.id, child);
        }
        for (const child of this.documents || []) {
            byId.set(child.id, child);
        }
        for (const id of obj.childrenIncludingDocuments || []) {
            const child = byId.get(de.oldIdToNewId[id] ?? -1);
            if (child) {
                this.childrenIncludingDocuments ||= [];
                this.childrenIncludingDocuments.push(child);
                byId.delete(de.oldIdToNewId[id] ?? -1);
            }
        }
        if (byId.size) {
            // Anything left in byId wasn't included in the childrenIncludingDocuments array.
            this.childrenIncludingDocuments ||= [];
            this.childrenIncludingDocuments.push(...byId.values());
        }

        this.groups = de.reviveMany(
            obj.groups,
            (group) => new ReflectionGroup(group.title, this),
        );
        this.categories = de.reviveMany(
            obj.categories,
            (cat) => new ReflectionCategory(cat.title),
        );
    }
}
