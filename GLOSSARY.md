# VBox

VBox lets authors describe presentation alongside semantic Vue templates. This glossary names the styling concepts shared by its engine, template tooling, editor tooling, and consumers.

## Language

### Authoring

**Native styling interface**:
The authoring interface for applying VBox styling directly to native elements or Vue component instances while retaining their original tags and semantic bindings.
_Avoid_: Polymorphic interface when referring to native styling

**Legacy component interface**:
The supported authoring interface in which a polymorphic VBox component receives styling props and chooses or adopts the rendered element.
_Avoid_: Removed interface, deprecated interface

**Style namespace**:
The reserved family of template binding names that identifies VBox styling separately from ordinary HTML attributes and Vue component props.

**Style binding**:
A template binding that explicitly supplies styling to VBox, either as an individual property or as grouped styling.
_Avoid_: HTML attribute when specifically referring to VBox styling

**Grouped style binding**:
A style binding that supplies one reusable style object or an ordered collection of style sources.
_Avoid_: Ordinary object spread, which does not itself express styling intent

**Semantic binding**:
An ordinary binding whose meaning belongs to the underlying element or Vue component rather than VBox styling.
_Avoid_: Non-style attribute when this would exclude component props or listeners

**Style declaration**:
A styling property and its value, together with the styling context in which that value applies.

**Style object**:
A reusable collection of styling declarations and conditional groups, independent of the template names used to attach it.
_Avoid_: Attribute bag

**Style source**:
A contribution of styling from an individual binding, a reusable style object, or a component's internal styling.

**Compatibility spelling**:
A supported older name for the same styling concept, retained so existing style objects remain reusable.
_Avoid_: Invalid spelling, deprecated spelling, custom alias

### Conditions And Composition

**Styling context**:
The conditions under which a style declaration applies to its target, including any theme, interaction, viewport, container, or selector qualifications.
_Avoid_: Priority when referring to applicability rather than which declaration wins

**Base styles**:
Declarations without conditional qualifications within the styling being described.
_Avoid_: Internal styles, since parent-applied styling can also contain base styles

**Conditional styles**:
Declarations that apply only when their styling conditions match.
_Avoid_: Overrides when merely describing the presence of a condition

**Combined context**:
A styling context that requires more than one condition to match, such as a particular theme together with a hover state.

**Condition group**:
A collection of styling qualified by a condition, which may contain further condition groups.

**Resting context**:
A styling context without an interaction-state qualification; it may still be qualified by a theme, viewport, or container condition.
_Avoid_: Base context when other conditions are present

**Interaction context**:
A styling context qualified by an interaction state, potentially together with other conditions.

**Style owner**:
The authoring origin of a styling contribution, distinguishing a component's own styling from styling supplied by its callers.
_Avoid_: DOM ancestor, CSS inheritance

**Internal styles**:
Styling authored inside a component as its own presentation, including its base and conditional declarations.
_Avoid_: Base styles when conditional declarations are also included

**Parent-applied styles**:
Styling supplied at a component's usage site rather than inside its implementation; this is distinct from CSS inherited from an ancestor element.
_Avoid_: Inherited styles

**Override**:
A styling contribution that takes precedence over a conflicting contribution in the applicable styling context, without implying replacement of unrelated declarations.

**Style priority**:
VBox's precedence between applicable styling contributions, including their styling contexts and owners.
_Avoid_: CSS specificity, which describes selector weighting rather than VBox's authoring contract

**Override withdrawal**:
The removal of a styling contribution so that the remaining applicable declarations determine the result.
_Avoid_: Reset, since an explicit reset value is itself a declaration

**Style target**:
The rendered element intended to receive a styling contribution, including an element explicitly selected by a component through attribute forwarding.
_Avoid_: Component root when the component has several roots

### Theme Vocabulary

**Design token**:
A named design value that can be referenced in styling instead of repeating its raw value.
_Avoid_: Alias when referring to a value rather than a property name

**Token preview**:
An editor explanation of a recognized design token's resolved value, independent of whether the surrounding binding is consumed as VBox styling.
_Avoid_: Applied style, computed style

**Property alias**:
An alternative name for a styling property, supplied by VBox or a project's configuration.
_Avoid_: Design token

**Theme**:
A coordinated set of design values and appearance choices, such as default and dark appearances.

**Breakpoint**:
A named viewport threshold used to qualify responsive styling.
_Avoid_: Media query when referring specifically to a named threshold rather than a general condition
