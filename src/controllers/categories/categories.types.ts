export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

/** Category with nested children for tree response */
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export interface CreateCategoryDTO {
  name: string;
  parent_id?: string | null;
}
